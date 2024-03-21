const adminController = require("../controllers/adminController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();



router.get('/dashboard',middlewareController.verifyToken, adminController.dashboard);
router.get('/loginAdmin', adminController.loginAdmin);
router.get('/registerAdmin', adminController.registerAdmin);
router.post('/register', adminController.register);
router.post("/login", adminController.login);
router.get('/listUser',middlewareController.isAdmin ,adminController.listUser);
router.post('/addStudent',adminController.addUser);
router.get('/edit/:id', adminController.edit);
router.post('/update/:id', adminController.updated);
router.get('/delete/:id', adminController.delete);
router.post('/refresh', adminController.reqRefreshToken);
router.get('/signOut', adminController.logout);
router.get('/student', adminController.listStudents);
router.get('/coordinator', adminController.listCoordinators);
router.get('/manager', adminController.listManagers);
router.get('/listFaculty', adminController.listFaculty);
router.post('/addFaculty', adminController.addFaculty);

module.exports = router;