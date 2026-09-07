# Requirements
- Do not do anything unless there is a requirement for it.

# Backend project
- Login feature
- The admin can create, update, and delete everything.
- The file is upload to `/public/upload`

## DATABASE
### Tables
#### admin
    - username
    - password
    - email

#### customer
    - username
    - password
    - email
    - point
    - avataId -> fileId
    - adminId -> admin.id

#### file
    - name
    - detail
