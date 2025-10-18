from qdrant_client import QdrantClient
from app.lib.constants import QDRANT_COLLECTION_1,QDRANT_COLLECTION_2,QDRANT_HOST,QDRANT_PORT
from qdrant_client.models import Distance, VectorParams
from fastembed import TextEmbedding
from qdrant_client.http.models import PointStruct

class Qdrant:
    def __init__(self):
        self.client = QdrantClient(host=QDRANT_HOST,port=QDRANT_PORT)
        self.create_collections()

    def create_collections(self):
        try:
            if(self.client):
                self.client.create_collection(
                    collection_name=QDRANT_COLLECTION_1,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
                )
                self.client.create_collection(
                    collection_name=QDRANT_COLLECTION_2,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
                )
        except Exception as e:
            print(e)

    def get_client(self):
        return self.client
    
    def get_embedder(self):
        return TextEmbedding()
    
    def insert_raw_report_embedding(self,embeddings,report_id,user_id):
        try:
            point = PointStruct(
                id=report_id,
                vector=embeddings,
                payload={
                    "user_id": user_id
                }
            )
            qdrant.upsert(collection_name=QDRANT_COLLECTION_1, points=[point])
            print("Raw Text Embeddings inserted for report "+report_id)
        except Exception as e:
            print("Error while storing raw_report embeddings",e)


    def __del__(self):
        del self.client


client = Qdrant()
qdrant = client.get_client()
embedder = client.get_embedder()