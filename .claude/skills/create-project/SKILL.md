---
"name": "create-project"
description: Workflow for adding a new project
---
- Save under the `/[project-name]` folder.
- Read `/ideas/[project-name]-idea.md`.

## Phase 1: when the backend project has not been generated yet
- /add-feature

## Phase 2: when the backend project has already been generated

1. Step 1. Create the steering
- Based on the requirements, create `requirement.md`, `structure.md`, and `task.md`
- Save them in the `/docs/steering/[project-name]` folder

2. Step 2. Execute the tasks
- Base it on `task.md`
- Execute the tasks and add the feature
- Check the tasks, and execute any that are not yet complete

3. Step 3. Testing
- Write tests in the `service` folder and the `middleware` folder
- Run the tests
- Fix any bugs

4. Step 4. Verification
