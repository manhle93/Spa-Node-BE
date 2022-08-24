var express = require("express");
var router = express.Router();
var multer  = require('multer')
const UserController = require("../controllers").UserController;
const RoleController = require("../controllers").RoleController;
const AuthController = require("../controllers").AuthController;
const UserValidator = require("../validation/userValidator");
const Auth = require("../validation/auth");
var uuid = require("uuid");

const fileFilter = (req, file, cb) => {
  let name = file.originalname.split(".")
  const extenImage = ['png', 'jpg', 'jpeg'] 
  const typePics = ['image/png', 'image/jpg', 'image/jpeg']
  if(typePics.includes(file.mimetype) && extenImage.includes(name[name.length -1].toLowerCase())){
    cb(null, true)
  }else {
    cb(null, false)
  }
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/avatar')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() +uuid.v4() + '-'+file.originalname)
  }
})
var upload = multer({ storage: storage, fileFilter: fileFilter })


router.post("/seeddata", RoleController.initFirstData);
/* Auth Router. */
router.post("/login", UserValidator.login(), AuthController.login);
router.post("/signup", UserValidator.signUp(), AuthController.signUp);
router.post("/refresh", AuthController.refreshToken);
router.get("/logout", Auth.auth, AuthController.logout);
router.get("/logoutall", Auth.auth, AuthController.logoutAllDevice);
router.get("/me",Auth.auth, AuthController.me);

/* Menu Role Router. */
router.get("/menus", Auth.auth, RoleController.getMenu);
router.get("/menudashboard", Auth.auth, RoleController.getMenuAdmin);
router.get("/routenames", Auth.auth, RoleController.getRouterName);
router.post("/addmenu", Auth.auth, RoleController.addMenu);
router.put("/updatemenu", Auth.auth, RoleController.editMenu);
router.delete("/deletemenu", Auth.auth, RoleController.deleteMenu);
router.get("/parentmenu", Auth.auth, RoleController.getParentMenu);
router.get("/roles", Auth.auth, RoleController.getAllRole);
router.get("/rolemenulist", Auth.auth, RoleController.getMenuForRole);
router.post("/updaterolemenu", Auth.auth, RoleController.updateMenuRole);

/* User Router. */
router.post("/changepassword", Auth.auth, UserValidator.changePassword(), UserController.changePassword);
router.get("/users", Auth.auth, UserController.userList);
router.post("/activeuser", Auth.auth, UserController.activeUser);
router.post("/uploadavatar", upload.single('avatar'), UserController.uploadAvatar);
router.post("/updateuser", UserValidator.updateUser(), Auth.auth, UserController.updateUser);
router.post("/createuser", UserValidator.createUser(), Auth.auth, UserController.createUser);










module.exports = router;
