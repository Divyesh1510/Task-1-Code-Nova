import os
from typing import List
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import engine, Base, get_db
import models
import schemas

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Notes CRUD API",
    description="Production-ready FastAPI backend for Notes management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins_env = os.getenv("CORS_ORIGINS", "*")
if origins_env.strip() == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
def health_check():
    """Health check endpoint to verify backend service status."""
    return {"status": "ok", "service": "Notes CRUD Backend"}


@app.get("/api/notes", response_model=List[schemas.NoteResponse], tags=["Notes"])
def get_notes(db: Session = Depends(get_db)):
    """Fetch all notes sorted by latest updated."""
    return db.query(models.Note).order_by(desc(models.Note.updated_at)).all()


@app.post("/api/notes", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED, tags=["Notes"])
def create_note(note_in: schemas.NoteCreate, db: Session = Depends(get_db)):
    """Create a new note requiring title and content."""
    title = note_in.title.strip()
    content = note_in.content.strip()
    if not title or not content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Title and content cannot be blank"
        )
    
    new_note = models.Note(
        title=title,
        content=content
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note


@app.put("/api/notes/{id}", response_model=schemas.NoteResponse, tags=["Notes"])
def update_note(id: int, note_in: schemas.NoteUpdate, db: Session = Depends(get_db)):
    """Update an existing note's title or content."""
    note = db.query(models.Note).filter(models.Note.id == id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {id} not found"
        )

    if note_in.title is not None:
        trimmed_title = note_in.title.strip()
        if not trimmed_title:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Title cannot be empty"
            )
        note.title = trimmed_title

    if note_in.content is not None:
        trimmed_content = note_in.content.strip()
        if not trimmed_content:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Content cannot be empty"
            )
        note.content = trimmed_content

    db.commit()
    db.refresh(note)
    return note


@app.delete("/api/notes/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Notes"])
def delete_note(id: int, db: Session = Depends(get_db)):
    """Delete a note by ID."""
    note = db.query(models.Note).filter(models.Note.id == id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {id} not found"
        )
    db.delete(note)
    db.commit()
    return None

