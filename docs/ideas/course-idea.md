# Course feature

- Ability to CRUD items.

## Requirements

### Backend project

#### DATABASE

##### Table 
###### course
- name
- image (file.id)

###### chapter
- number
- name
- image (file.id)
- course_id (course.id)

###### word
- chaper_id(chapter.id)

### Admin Project
- CRUD Course.
- CRUD Chapter.

### folder structure
- use page `/id/edit` to edit
- use page `/new` to create new

#### Components
- Add a "Courses" entry to the navigation bar (Course).
- Add a "Chapter" entry to the navigation bar (Chapter).
