from qdrant_client import AsyncQdrantClient
from qdrant_client.http.models import models

# Make sure that the collection exists or create it
collection_name = "user_vectors"

async def connect_to_qdrant():
    try:
        print('Connecting to Qdrant...')
        qdrant_client = AsyncQdrantClient(
            url="https://ed479051-28a5-4f74-87a1-f573ab59faf7.eu-central-1-0.aws.cloud.qdrant.io:6333", 
            api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.IdZOBpY-t4MWrMeR5BaSPZV3_as0pHIJRoYqvJlRUH0",
        )
        print('Connected to Qdrant')
        # Create collection if not exists
        await qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config={"size": 384, "distance": "Cosine"},  # 384 is embedding size of MiniLM
        )
        from qdrant_client.models import PayloadSchemaType

        await qdrant_client.create_payload_index(
            collection_name="user_vectors",
            field_name="_id",
            field_schema=PayloadSchemaType.KEYWORD
        )

        print ("Collection created:")
        print(await qdrant_client.get_collections())
    except Exception as e:
        # Only ignore the "already exists" error
        if "already exists" in str(e):
            print("Collection already exists. Continuing...")
        else:
            raise ConnectionError("Failed to connect to Qdrant: " + str(e))
    return qdrant_client


# # Initialize Qdrant client (adjust host/port if needed)
# qdrant_client = QdrantClient(
#     url="https://ed479051-28a5-4f74-87a1-f573ab59faf7.eu-central-1-0.aws.cloud.qdrant.io:6333", 
#     api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.IdZOBpY-t4MWrMeR5BaSPZV3_as0pHIJRoYqvJlRUH0",
# )
