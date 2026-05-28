import faiss
import numpy as np

index = faiss.IndexFlatL2(384)

stored_chunks = []

def store_embeddings(chunks, embeddings):
    global stored_chunks

    stored_chunks.extend(chunks)

    embeddings = np.array(embeddings).astype('float32')

    index.add(embeddings)

def search(query_embedding, k = 5):
    D, I = index.search(np.array([query_embedding]).astype('float32'), k)

    results = [stored_chunks[i] for i in I[0]]

    return results