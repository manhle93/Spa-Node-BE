const User = require("../models").User;
const Role = require("../models").Role;
const {validationResult} = require("express-validator");
var bcrypt = require("bcryptjs");
const Op = require("sequelize").Op;

class UserController {
  changePassword = async (req, res) => {
    const user = req.user;
    const data = req.body;
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    if (!errors.isEmpty()) {
      res.status(422).json({message: "Nhập đầy đủ dữ liệu để thay đổi mật khẩu", errors: errors.array()});
      return;
    }
    if (data.newPassWord !== data.reNewPassWord) {
      return res.status(401).json({message: "Mật khẩu 2 lần nhập không chính khớp"});
    }
    if (data.newPassWord === data.currentPass) {
      return res.status(401).json({message: "Mật khẩu mới không được trùng mật khẩu cũ !"});
    }
    let checkPass = bcrypt.compareSync(data.currentPass, user.password);
    if (!checkPass) {
      return res.status(402).json({message: "Mật khẩu hiện tại không chính xác"});
    }
    try {
      let passHashed = bcrypt.hashSync(data.newPassWord, 10);
      await user.update({
        password: passHashed,
        tokens: null, //Logout all
      });
      return res.status(200).json({message: "Đổi mật khẩu thành công"});
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "Không thể đổi mật khẩu"});
    }
  };
  userList = async (req, res) => {
    const page = req.query.page ? req.query.page : 1;
    const perPage = req.query.perPage ? req.query.perPage : 10;
    const search = req.query.search ? req.query.search : null;
    const roleId = req.query.roleId ? req.query.roleId : null;
    const data = await User.paginate({
      where: search ? {name: {[Op.like]: `%${search}%`}} : {},
      page: page, // Default 1
      paginate: perPage, // Default 25
      order: [["updatedAt", "DESC"]],
      include: [{model: Role, as: "role"}],
    });

    data.currentPage = page;
    return res.status(200).json(data);
  };
  activeUser = async (req, res) => {
    const data = req.body;
    const user = req.user;
    if (!data.userId) {
      return res.status(404).json({message: "Người dùng không tồn tại"});
    }
    if (data.userId === user.id) {
      return res.status(402).json({message: "Không thể thay đổi trạng thái của chính mình"});
    }
    try {
      await User.update(
        {
          active: data.active,
          tokens: null,
        },
        {where: {id: data.userId}}
      );
      return res.status(200).json("Thành công!");
    } catch (error) {
      return res.status(500).json("Không thể cập nhật trạng thái người dùng!");
    }
  };
  updateUser = async (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    if (!errors.isEmpty()) {
      res.status(422).json({message: "Dữ liệu không hợp lệ! Không thể đăng ký", errors: errors.array()});
      return;
    }
    const data = req.body;
    if (data.password !== data.confirmPassword) {
      res.status(422).json({message: "Mật khẩu 2 lần nhập không trùng khớp"});
    }
    if (!data.id) {
      res.status(422).json({message: "Người dùng không tồn tại"});
    }
    const checkUserName = await User.findOne({where: {userName: data.userName, id: {[Op.not]: data.id}}});
    const checkEmail = await User.findOne({where: {email: data.email, id: {[Op.not]: data.id}}});
    if (checkUserName) {
      res.status(401).json({message: "Tên đăng nhập đã tồn tại"});
    }
    if (checkEmail) {
      res.status(401).json({message: "Email đã tồn tại"});
    }
    try {
      const user = await User.findOne({where: {id: data.id}});
      if (data.password) {
        let passHashed = bcrypt.hashSync(data.password, 10);
        user.update({
          name: data.name,
          userName: data.userName,
          email: data.email,
          password: passHashed,
          roleId: data.roleId,
          urlImage: data.urlImage,
          tokens: null
        });

      } else {
        user.update({
          name: data.name,
          userName: data.userName,
          email: data.email,
          roleId: data.roleId,
          urlImage: data.urlImage,
        });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "Không thể cập nhật người dùng."});
    }
  };
  createUser = async (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    if (!errors.isEmpty()) {
      res.status(422).json({message: "Dữ liệu không hợp lệ! Không thể đăng ký", errors: errors.array()});
      return;
    }
    const data = req.body;
    if (data.password !== data.confirmPassword) {
      res.status(422).json({message: "Mật khẩu 2 lần nhập không trùng khớp"});
    }
    const checkUserName = await User.findOne({where: {userName: data.userName}});
    const checkEmail = await User.findOne({where: {email: data.email}});
    if (checkUserName) {
      res.status(401).json({message: "Tên đăng nhập đã tồn tại"});
    }
    if (checkEmail) {
      res.status(401).json({message: "Email đã tồn tại"});
    }
    try {
      let passHashed = bcrypt.hashSync(data.password, 10);
      const user = await User.create({
        name: data.name,
        userName: data.userName,
        email: data.email,
        password: passHashed,
        roleId: data.roleId,
        active: false,
        urlImage: data.urlImage,
      });

      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "Không thể cập nhật người dùng."});
    }
  };
  uploadAvatar = async (req, res) => {
    return res.json(req.file);
  };
}

module.exports = new UserController();
