from qdrant_client import QdrantClient
from app.lib.constants import QDRANT_COLLECTION_1,QDRANT_COLLECTION_2,QDRANT_HOST,QDRANT_PORT
from qdrant_client.models import Distance, VectorParams,models
from fastembed import TextEmbedding
from qdrant_client.http.models import PointStruct
import uuid

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
            # print(e)
            pass

    def get_client(self):
        return self.client
    
    def get_embedder(self):
        return TextEmbedding()
    
    def insert_raw_report_embedding(self,embeddings,report_id,user_id,chunk_id,collection_id):
        try:
            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=embeddings,
                payload={
                    "user_id": str(user_id),
                    "report_id":str(report_id),
                    "chunk_id":str(chunk_id),
                    "collection_id":str(collection_id)
                }
            )
            qdrant.upsert(collection_name=QDRANT_COLLECTION_1, points=[point])
            print(f"Raw Text Embeddings inserted for report {report_id}")
        except Exception as e:
            print("Error while storing raw_report embeddings",e)
    
    def similarity_search_collection1(self,user_id,query_str,top_k=5):
        embedder = self.get_embedder()
        embeddings=list(embedder.embed(query_str))[0]

        search_res = self.client.query_points(
            collection_name=QDRANT_COLLECTION_1,
            query=embeddings,
            limit=top_k,
            with_payload=True,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="user_id",
                        match=models.MatchValue(
                            value=user_id,
                        ),
                    )
                ]
            )
        )
        return search_res.points


    def __del__(self):
        del self.client


client = Qdrant()
qdrant = client.get_client()
embedder = client.get_embedder()