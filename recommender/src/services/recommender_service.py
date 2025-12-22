from sentence_transformers import SentenceTransformer
from data_struct.user_type import User
from typing import cast
import nltk
import spacy
import string
from nltk.corpus import stopwords

# Download required resources (only once)
nltk.download('stopwords')
nlp = spacy.load("en_core_web_sm")

stop_words = set(stopwords.words('english'))

class RecommenderService:

  def __init__(self):
    self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    self.text = ""

  def preprocess(self, user: User):
    
    # convert the extracted data to a string
    values = user.skills + [user.about]
    combined_text = " ".join(values).lower()

    # Process with spaCy
    doc = nlp(combined_text)

    # Lemmatize, remove stopwords & punctuation
    tokens = [
        token.lemma_ for token in doc
        if token.lemma_ not in stop_words
        and token.lemma_ not in string.punctuation
        and not token.is_space
    ]

    # Final cleaned string
    cleaned_text = " ".join(tokens)
    self.text = cleaned_text
  
  def verctorize(self):
    '''
    Vectorize the cleaned text using the sentence transformer model.
    '''
    if not self.text:
        raise ValueError("No text to vectorize. Did you run `preprocess()`?")
    vector = self.model.encode(self.text)   
    vector_list = vector.tolist()       
    return vector_list