var bcrypt = require("bcryptjs");
const User = require("../models").User;
const {validationResult} = require("express-validator");
const JWT_CONFiG = require("../config/jwt");
const Op = require("sequelize").Op;
const jwt = require("jsonwebtoken");
const Role = require("../models").Role;

class AuthController {
  login = async (req, res, next) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    if (!errors.isEmpty()) {
      res.status(422).json({message: "Vui lòng nhập email, hoặc tên đăng nhập và mật khẩu", errors: errors.array()});
      return;
    }
    const data = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [{email: data.email_username}, {userName: data.email_username}],
      },
    });
    if(!user){
      return res.status(422).json({message: "Email hoặc tên đăng nhập không chính xác"});
    }
    if(!user.active){
      return res.status(401).json({message: "Tài khoản chưa được kích hoạt"});
    }
    let checkPass = bcrypt.compareSync(data.password, user.password);
    if (checkPass) {
      const token = await this.generateToken(user);
      if (token) {
        return res.status(200).json(token);
      } else {
        return res.status(500).json({message: "Đăng nhập thất bại"});
      }
    } else {
      return res.status(422).json({message: "Mật khẩu không chính xác"});
    }
  };
  generateToken = async user => {
    try {
      const access_token = jwt.sign({user_id: user.id}, JWT_CONFiG.SECRET_KEY, {expiresIn: JWT_CONFiG.AccessTokenTime});
      // const refresh_token = jwt.sign({ user_id: user.id }, JWT_CONFiG.SECRET_KEY, { expiresIn: JWT_CONFiG.RefreshTokenTime });
      let oldToken = JSON.parse(user.tokens);
      if (oldToken === null) {
        oldToken = [];
      }
      // oldToken.push({ access_token: access_token, refresh_token: refresh_token })
      oldToken.push(access_token);
      await user.update({
        tokens: JSON.stringify(oldToken),
      });
      return {message: "Đăng nhập thành công", token: access_token, expiresIn: JWT_CONFiG.AccessTokenTime};
    } catch (error) {
      return false;
    }
  };
  signUp = async (req, res, next) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    if (!errors.isEmpty()) {
      res.status(422).json({message: "Dữ liệu không hợp lệ! Không thể đăng ký", errors: errors.array()});
      return;
    }
    const data = req.body;
    let passHashed = bcrypt.hashSync(data.password, 10);
    try {
      const user = await User.create({
        name: data.name,
        userName: data.userName,
        email: data.email,
        password: passHashed,
        roleId: 1,
      });
      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  };
  refreshToken = async (req, res) => {
    try {
      const token = req.header("Authorization").replace("Bearer", "").trim();
      if (!token) {
        return res.status(422).json({message: "Token không tồn tại"});
      }
      let decodedToken = null;
      decodedToken = jwt.verify(token, JWT_CONFiG.SECRET_KEY, {ignoreExpiration: true});
      const user = await User.findOne({where: {id: decodedToken.user_id}});
      if (!user) {
        return res.status(404).json({message: "User không tồn tại"});
      }
      let now = Math.floor(Date.now() / 1000);
      if (Number(now - decodedToken.exp) > Number(JWT_CONFiG.RefreshTokenTime)) {
        return res.status(401).json({message: "Vui lòng đăng nhập lại"});
      }
      const newToken = await this.generateToken(user);
      return res.status(200).json(newToken);
    } catch (error) {
      return res.status(500).json(error);
    }
  };
  logout = async (req, res) => {
    const user = req.user;
    const token = req.header("Authorization").replace("Bearer", "").trim();
    const tokenList = JSON.parse(user.tokens);
    let indexToken = tokenList.findIndex(el => el === token);
    if (indexToken != -1) {
      tokenList.splice(indexToken, 1);
      await user.update({
        tokens: JSON.stringify(tokenList),
      });
    }
    return res.status(200).json({message: "Đăng xuất thành công"});
  };
  logoutAllDevice = async (req, res) => {
    const user = req.user;
    await user.update({tokens: null});
    return res.json({message: "Đã đăng xuất trên toàn bộ thiết bị"});
  };
  me = async (req, res) => {
    try {
      const token = req.header("Authorization").replace("Bearer", "").trim();
      const decodeJwt = jwt.verify(token, JWT_CONFiG.SECRET_KEY);
      const user = await User.findOne({where: {id: decodeJwt.user_id}, include: [
        {model: Role, as: "role"},
      ]});
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(null);
    }
  };
}

module.exports = new AuthController();
