import  threading
import time
from delete_scheduler import delete_reports
from enque_scheduler import  scheduler_enqueue

if __name__ == "__main__":
    t1 = threading.Thread(target=delete_reports, daemon=True)
    t2 = threading.Thread(target=scheduler_enqueue, daemon=True)
    t1.start()
    t2.start()

    # Keep main thread alive
    while True:
        time.sleep(1)