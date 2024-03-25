import concurrent.futures
import subprocess

# Define the paths to your Python scripts
scripts = ["dreamwaretech.py",  "rebeltech.py",  "wootware.py"]
#"evetech.py","takealot.py",
def run_script(script):
    print(f"Running {script}...")
    subprocess.run(["python", script])
    print(f"{script} finished.")

# # Using ThreadPoolExecutor to run scripts in parallel
# with concurrent.futures.ThreadPoolExecutor() as executor:
#     executor.map(run_script, scripts)


with concurrent.futures.ProcessPoolExecutor() as executor:
    executor.map(run_script, scripts)