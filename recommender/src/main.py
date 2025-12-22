from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.recommender_service import RecommenderService
from config.qdrant import collection_name, connect_to_qdrant
from data_struct.user_type import User
from qdrant_client.models import PointStruct
from qdrant_client.http.models import (
    Filter,
    FieldCondition,
    MatchValue
)
from uuid import uuid4
import numpy as np

app = FastAPI()
service = RecommenderService()

@app.on_event("startup")
async def startup_event():
    global qdrant_client
    qdrant_client = await connect_to_qdrant()
    print("Qdrant client initialized.")

app.add_middleware(CORSMiddleware, 
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"])


@app.post("/vectorize")
async def vectorize_user(user: User):
  try:
      # Preprocess and vectorize
      vectorId = uuid4()
      service.preprocess(user=user)
      vector = service.verctorize()  # spelling fix below
      print(user)
      payload=user.model_dump(by_alias=True)
      print(payload)
      point = PointStruct(id=str(vectorId), vector=vector, payload=payload)
      print('Upserting now...')
      await qdrant_client.upsert(collection_name=collection_name, points=[point])
      return { "embedding": vector, "id": user.userId, "Success": "True" }
  except Exception as e:
      raise HTTPException(status_code=400, detail=str(e))

from fastapi import HTTPException
import numpy as np
from qdrant_client.models import Filter, FieldCondition, MatchValue

@app.post("/recommend")
async def recommend_user(user: User):
    try:
        print('Recommending...')
        user_id = str(user.userId)  # Always cast to string if that's how it's stored

        # Step 1: Retrieve user's vector from Qdrant
        retrieved_points, _ = await qdrant_client.scroll(
            collection_name="user_vectors",
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="_id",  # Ensure this matches what's stored in Qdrant
                        match=MatchValue(value=user_id)
                    )
                ]
            ),
            with_payload=True,
            with_vectors=True
        )

        if not retrieved_points:
            print(f"Point with userId {user_id} not found.")
            return { "similar_users": [] }

        print(f"Vector found for userId: {user_id}")
        target_vector_list = retrieved_points[0].vector

        # Step 2: Convert to numpy array
        if target_vector_list is None:
            print(f"No vector associated with userId {user_id}.")
            return { "similar_users": [] }

        target_vector = np.array(target_vector_list, dtype=np.float32)

        # Step 3: Perform similarity search
        search_result = await qdrant_client.search(
            collection_name="user_vectors",
            query_vector=target_vector.tolist(),  # Ensure it's a plain list
            limit=5,
            with_payload=True,
            query_filter=Filter(
                must_not=[
                    FieldCondition(
                        key="_id",  # Same key used above
                        match=MatchValue(value=user_id)
                    )
                ]
            )
        )

        if not search_result:
            print("No similar users found.")
            return { "similar_users": [] }
        
        print(search_result)

        for result in search_result:
            print('Result Id is: ', result.id, 'score is: ', result.score, 'Payload is: ', result.payload)

        return { "similar_users": [result.payload for result in search_result] }

    except Exception as e:
        print(f"Error during recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

