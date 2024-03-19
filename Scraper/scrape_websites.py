import concurrent.futures
import subprocess

# Define the paths to your Python scripts
scripts = ["dreamwaretech.py", "evetech.py", "rebeltech.py", "takealot.py", "wootware.py"]

def run_script(script):
    subprocess.run(["python", script])

# # Using ThreadPoolExecutor to run scripts in parallel
# with concurrent.futures.ThreadPoolExecutor() as executor:
#     executor.map(run_script, scripts)


with concurrent.futures.ProcessPoolExecutor() as executor:
    executor.map(run_script, scripts)