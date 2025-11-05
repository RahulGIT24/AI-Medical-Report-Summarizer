from qdrant_client import QdrantClient
from app.lib.constants import QDRANT_COLLECTION_1,QDRANT_COLLECTION_2,QDRANT_HOST,QDRANT_PORT
from qdrant_client.models import Distance, VectorParams,models
from fastembed import TextEmbedding
from fastembed import SparseTextEmbedding
from qdrant_client import models
from qdrant_client.models import Query, SparseVector, Fusion
import uuid

from sympy.codegen.cxxnodes import using


class Qdrant:
    def __init__(self):
        self.client = QdrantClient(host=QDRANT_HOST,port=QDRANT_PORT)
        self.create_collections()

    def create_collections(self):
        try:
            if(self.client):
                self.client.create_collection(
                    collection_name=QDRANT_COLLECTION_1,
                    vectors_config={"dense_vector":models.VectorParams(size=384, distance=models.Distance.COSINE)},
                    sparse_vectors_config={"sparse_vector":models.SparseVectorParams()}
                )
                self.client.create_collection(
                    collection_name=QDRANT_COLLECTION_2,
                    vectors_config={"dense_vector": models.VectorParams(size=384, distance=models.Distance.COSINE)},
                    sparse_vectors_config={"sparse_vector": models.SparseVectorParams()}
                )
        except Exception as e:
            # print(e)
            pass

    def get_client(self):
        return self.client
    
    def get_dense_embedder(self):
        return TextEmbedding()
    
    def get_sparse_embedder(self):
        return SparseTextEmbedding(model_name="Qdrant/bm42-all-minilm-l6-v2-attentions")
    
    def insert_raw_report_embedding(self,dense_embeddings,sparse_embeddings,report_id,user_id,chunk_id,collection_id,collection_name):
        try:
            sparse_vector = {
                "indices": sparse_embeddings.indices.tolist(),
                "values": sparse_embeddings.values.tolist()
            }

            vector={
                "dense_vector":dense_embeddings,
                "sparse_vector":sparse_vector
            }
            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={
                    "user_id": str(user_id),
                    "report_id":str(report_id),
                    "chunk_id":str(chunk_id),
                    "collection_id":str(collection_id),
                    "collection_name":str(collection_name)
                }
            )
            qdrant.upsert(collection_name=QDRANT_COLLECTION_1, points=[point])
            print(f"Raw Text Embeddings inserted for report {report_id}")
        except Exception as e:
            print("Error while storing raw_report embeddings",e)
    
    def similarity_search_collection1(self,user_id,query_str,top_k=5):
        try:
            search_res = self.client.query_points(
                collection_name=QDRANT_COLLECTION_1,
                prefetch=[
                    models.Prefetch(
                        query=models.Document(
                            text=query_str,
                            model="Qdrant/bm42-all-minilm-l6-v2-attentions",
                        ),
                        using="sparse_vector",
                        limit=7,
                    ),
                    models.Prefetch(
                        query=models.Document(
                            text=query_str,
                            model="BAAI/bge-small-en-v1.5",
                        ),
                        using="dense_vector",
                        limit=7,
                    ),
                ],
                query=models.FusionQuery(fusion=models.Fusion.RRF),
                limit=top_k,
                with_payload=True,
                query_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="user_id",
                            match=models.MatchValue(value=str(user_id)),
                        )
                    ]
                )
            )
            return search_res.points
        except Exception as e:
            print(e)
            return None


    def __del__(self):
        del self.client


client = Qdrant()
qdrant = client.get_client()
dense_embedder = client.get_dense_embedder()
sparse_embedder = client.get_sparse_embedder()