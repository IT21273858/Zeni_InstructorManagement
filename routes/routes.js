var express = require('express');

const router = express.Router();
const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient();



// Course creation
router.route('/course/create').post((req, res) => {
    const resourceData = {
        r_name: req.body.r_name,
        url: req.body.url,
        type: req.body.type,
        moduleId: "663abb6d3ef1eeb3638be0f0"
    };

    prisma.resources.create({ data: resourceData })
        .then((resource) => {
            if (resource) {
                console.log("Resource created:", resource);

                const moduleData = {
                    m_name: req.body.m_name,
                    m_description: req.body.m_description,
                    m_type: req.body.m_type,
                    courseId: "663abb6d3ef1eeb3638be0f0",
                    resources: { connect: { id: resource.id } } // Connecting the created resource to the module
                };

                prisma.module.create({ data: moduleData })
                    .then((module) => {
                        console.log("Module created:", module);
                        const data = {
                            moduleId: module.id
                        }
                        prisma.resources.update({
                            where: {
                                id: resource.id
                            }, data
                        }).then((res) => {
                            console.log("Resource updated with moduleID");
                        }).catch((err) => {
                            console.log("Error while updating moduleId in Resources", err);
                        })
                        const courseData = {
                            c_name: req.body.c_name,
                            c_description: req.body.c_description,
                            c_thumbnail: req.body.c_thumbnail,
                            classification: req.body.classification,
                            visibility: false,
                            c_InstructorId: req.body.c_InstructorId,
                            module: { connect: { id: module.id } }
                        };

                        prisma.course.create({ data: courseData })
                            .then((course) => {
                                console.log("Course created:", course);
                                const data = {
                                    courseId: course.id
                                }
                                prisma.module.update({
                                    where: {
                                        id: module.id
                                    }, data
                                }).then((re) => {
                                    console.log("Module updated with courseId");
                                }).catch((er) => {
                                    console.log("Error while updating courseId in Module", er);
                                })

                                res.status(201).json({ status: true, message: `Course, module, and resource created successfully`, data: course, code: "201" });
                            })
                            .catch((courseError) => {
                                console.error("Error creating course:", courseError);
                                res.status(500).json({ status: false, message: "New Course cannot be created", code: "500" });
                            });
                    })
                    .catch((moduleError) => {
                        console.error("Error creating module:", moduleError);
                        res.status(500).json({ status: false, message: "New Module cannot be created", code: "500" });
                    });
            } else {
                res.status(400).json({ status: false, message: "Error creating resource", code: "400" });
            }
        })
        .catch((resourceError) => {
            console.error("Error creating resource:", resourceError);
            res.status(500).json({ status: false, message: "New Resource / Module / Course cannot be created", code: "500" });
        });
});

// Get All Courses
router.route('/course/getAll').get((req, res) => {
    try {
        prisma.course.findMany({
            include: {
                module: {
                    include: {
                        resources: true
                    }
                },
                feedback: true,
                payment: true,
                enrollment: true
            }
        }).then((data) => {
            res.status(200)
                .json({ status: true, message: "Courses retrieved successful", data, code: "200" });
        })

    } catch (error) {
        console.error("Error finding courses:", error);
        res.status(500).json({ status: false, message: "Internal Server Error", code: 500 });
    }
})


// Function for Retreive only the specific course based on the id
router.route('/course/get/:id').get((req, res) => {
    const _id = req.params.id
    try {
        prisma.course.findUnique({
            where: {
                id: _id,
            },
            include: {
                module: {
                    include: {
                        resources: true
                    }
                },
                feedback: true,
                payment: true,
                enrollment: true
            }
        }).then((data) => {
            if (data) {
                res.status(200).json({ status: true, message: "Course found", course: data, code: "200" })
            } else {
                res.status(404).json({ status: false, message: "Course not found", code: "404" });
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Error while fetching course", code: "500" });
        console.log("Error while fetching course", error);
    }
});

// Update course details

router.route('/course/update/:id').patch((req, res) => {
    const _id = req.params.id
    const courseData = {
        c_name: req.body.c_name,
        c_description: req.body.c_description,
        c_thumbnail: req.body.c_thumbnail,
        classification: req.body.classification,
        visibility: false,
    };

    try {
        prisma.course.update({
            where: {
                id: _id
            },
            data: courseData
        }).then((data) => {
            if (data) {
                res.status(200).json({ status: true, message: "Course Updated Sucessfully", data: data, code: "200" })
            }
            else {
                res.status(404).json({ status: false, message: "Course not found", code: "404" })
            }
        })
    } catch (error) {
        res.status(500).json({ status: false, message: "Error occured while updating Course", code: "500" })
    }
});

// Add feedback
router.route('/course/feedback/create/:id').post((req, res) => {
    const _id = req.params.id
    const feedbacks = {
        feedback: req.body.feedback,
        userId: req.body.userId,
        courseId: _id
    };

    try {
        prisma.feedback.create({ data: feedbacks }).then((data) => {
            if (data) {
                res.status(200).json({ status: true, message: "Feedback added Sucessfully", data: data, code: "200" })
            }
            else {
                res.status(404).json({ status: false, message: "Feedback not found", code: "404" })
            }
        })
    } catch (error) {
        res.status(500).json({ status: false, message: "Error occured while adding feedback", code: "500" })
    }
});

router.route('/course/delete/:id').delete((req, res) => {
    const _id = req.params.id

    try {
        prisma.course.findUnique({
            where: {
                id: _id,
            },
            include: {
                module: {
                    include: {
                        resources: true
                    }
                },
                feedback: true,
                payment: true,
                enrollment: true
            }
        }).then((data) => {
            if (data) {
                const moduleId=data.module
                console.log("Mid",moduleId);
                res.status(200).json({ status: true, message: "Course found", course: data, mid:moduleId, code: "200" })
            } else {
                res.status(404).json({ status: false, message: "Course not found", code: "404" });
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Error while fetching course", code: "500" });
        console.log("Error while fetching course", error);
    }

    // ****************************************
    // try {

    //     prisma.course.delete({
    //         where: {
    //             id: _id,
    //         },
    //     }).then((data) => {
    //         if (data) {
    //             res.status(200).json({ status: true, message: "Course deleted", code: "200" })
    //         } else {
    //             res.status(404).json({ status: false, message: "Course not found", code: "404" });
    //         }
    //     });

    // } catch (error) {
    //     res.status(500).json({ status: false, message: "Error while deleting course", code: "500" });
    //     console.log("Error while deleting course", error);
    // }
});


// Function for Retreive only the specific user based on the id
router.route('/admin/get/:id').get((req, res) => {
    const _id = req.params.id
    try {
        prisma.user.findUnique({
            where: {
                id: _id,
            },
        }).then((data) => {
            if (data) {
                res.status(200).json({ status: true, message: "User found", user: data, role: data.Role, code: "200" })
            } else {
                res.status(404).json({ status: false, message: "User not found", code: "404" });
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Error while fetching user", code: "500" });
        console.log("Error while fetching user", error);
    }
});

router.route('/admin/login').post((req, res) => {
    try {
        prisma.user.findUnique({
            where: {
                email: req.body.email,
                password: req.body.password
            }
        }).then((data) => {
            if (data) {
                res.status(200).json({ status: true, message: "Login sucessful", user: data, role: data.Role, code: "200" })
            }
            else {
                res.status(404).json({ status: false, message: "Login Unsucessfull", code: "404" })
            }
        })
    } catch (error) {
        res.status(500).json({ status: false, message: "Error while login", code: "500" })
    }
});


// Learner route


router.route('/learner/getAll').get();

router.route('/learner/create').post();

router.route('/learner/update/:id').patch();

router.route('/learner/delete/:id').delete();

router.route('/learner/get/:id').get();

router.route('/learner/login').post();

module.exports = router;