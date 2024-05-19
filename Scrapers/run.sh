#!/bin/bash

# Define an array with the names of the Python scripts
scripts=(
  "dreamWareTech.py"
  "rebeltech.py"
  "titanice.py"
  "evetech.py"
  "wootware.py"
  "progenix.py"
  "takealot.py"
)

# Iterate over the array and execute each Python script
for script in "${scripts[@]}"
do
  echo "Running $script..."
  python "$script"
  
  # Check if the script ran successfully
  if [ $? -eq 0 ]; then
    echo "$script executed successfully."
  else
    echo "Error occurred while executing $script."
  fi
done

echo "All scripts executed."
