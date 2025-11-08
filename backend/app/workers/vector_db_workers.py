from app.lib import dense_embedder,client,sparse_embedder
from langchain.text_splitter import RecursiveCharacterTextSplitter

def clean_report(data):
    """Recursively drop None, empty strings, empty lists/dicts."""
    if isinstance(data, dict):
        return {k: clean_report(v) for k, v in data.items() if v not in (None, "", [], {})}
    elif isinstance(data, list):
        return [clean_report(x) for x in data if x not in (None, "", [], {})]
    else:
        return data

def flatten_recursive(data, parent_key=""):
    """Flatten any nested dict/list into key: value pairs as text."""
    items = []
    if isinstance(data, dict):
        for k, v in data.items():
            new_key = f"{parent_key}_{k}" if parent_key else str(k)
            items.extend(flatten_recursive(v, new_key))
    elif isinstance(data, list):
        for i, v in enumerate(data):
            new_key = f"{parent_key}_{i}" if parent_key else str(i)
            items.extend(flatten_recursive(v, new_key))
    else:
        items.append(f"{parent_key}: {str(data)}")
    return [str(x) for x in items]

def vectorize_raw_report_data(report_data):
    """
    Process each item in the report_data_list, clean, flatten, split into chunks, 
    embed each chunk, and store embeddings in Qdrant with proper metadata.
    """
    report_id = report_data.get("report_id",None)
    user_id = report_data.get("user_id",None)
    print(report_id,user_id)

    report_data_list = report_data.get("data",[])
    for report_dict in report_data_list:
        collection_id = report_dict.get("collection_id")
        collection_name = report_dict.get("name")
        data = report_dict.get("data", {})

        # 1. Clean and flatten the report
        cleaned = clean_report(data)
        flat_text = " | ".join(flatten_recursive(cleaned))

        # 2. Split into chunks with overlap
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,   # max 500 chars per chunk
            chunk_overlap=50  # 50 chars overlap between chunks
        )
        chunks = text_splitter.split_text(flat_text)

        # 3. Embed each chunk and store
        for idx, chunk in enumerate(chunks):
            dense_embeddings = list(dense_embedder.embed(chunk))[0]
            sparse_embeddings = list(sparse_embedder.embed(chunk))[0]
            client.insert_raw_report_embedding(
                dense_embeddings=dense_embeddings,
                sparse_embeddings=sparse_embeddings,
                chunk_id=idx,
                report_id=report_id,
                user_id=user_id,
                collection_id=collection_id,
                collection_name=collection_name
            )

        print(f"Inserted {len(chunks)} embeddings for report {report_id} in collection {collection_id}")

