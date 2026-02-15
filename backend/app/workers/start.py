import multiprocessing
import subprocess

def start_worker(name):
    subprocess.run(["rq", "worker", name])

if __name__ == "__main__":
    worker_names = ["email_worker", "raw_data_vectorization",'report_tasks']
    procs = []
    for name in worker_names:
        p = multiprocessing.Process(target=start_worker, args=(name,))
        p.start()
        procs.append(p)
    for p in procs:
        p.join()
