---
name: "add-feature"
description: Workflow for adding a feature
---

- Read everything in `/docs/spec`

## Phase 1: when the project has not been generated yet
1. Step 1. Make a plan
- Based on the spec, make a plan in plan mode
- Save it to `/plan/plan.md`

2. Step 2. Create the tasks
- Base it on the plan
- Save it to `/task/task.md`

3. Step 3. Execute the tasks
- Base it on `task.md`
- Execute the tasks and implement the project
- Check the tasks, and execute any that are not yet complete

4. Step 4. Testing
- Write tests in the `service` folder and the `middleware` folder
- Run the tests
- Fix any bugs

5. Step 5. Verification

## Phase 2: when the project has already been generated

- Read everything in `/docs/steering`

1. Step 1. Create the steering
- Based on the requirements, create `requirement.md`, `structure.md`, and `task.md`
- Save them in the `/docs/steering/[feature-name-YYYYMMDD]` folder

2. Step 2. Execute the tasks
- Base it on `task.md`
- Execute the tasks and add the feature
- Check the tasks, and execute any that are not yet complete

3. Step 3. Testing
- Write tests in the `service` folder and the `middleware` folder
- Run the tests
- Fix any bugs

4. Step 4. Verification
