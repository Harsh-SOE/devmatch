from pydantic import BaseModel, Field
from typing import List

class User(BaseModel):
    userId: str = Field(..., alias="_id")
    firstname: str
    lastname: str
    emailId: str
    photoUrl: str
    skills: List[str]
    about: str
    gender: str
    age: int

    class Config:
        underscore_attrs_are_private = False 