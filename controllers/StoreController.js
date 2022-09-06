
const Store = require("../models").Store;

class StoreController {
    getListStore = async (req, res) => {
        const page = req.query.page ? req.query.page : 1;
        const perPage = req.query.perPage ? req.query.perPage : 10;
        const search = req.query.search ? req.query.search : null;
        const active = req.query.active ? req.query.active : null;
        var searchQuery = {};
        if (search) {
            searchQuery = { ...searchQuery, name: { [Op.like]: `%${search}%` } }
        }

        if (active) {
            searchQuery = { ...searchQuery, active: active }
        }
        const data = await Store.paginate({
            where: searchQuery,
            page: page, // Default 1
            paginate: perPage, // Default 25
            order: [["updatedAt", "DESC"]],
        });

        data.currentPage = page;
        return res.status(200).json(data);
    };
    createStore = async (req, res) => {
        const user = req.user;
        const data = req.body;
        if (!data.name) {
            return res.status(401).json({ message: "Tên cơ sở không được bỏ trống" });
        }
        try {
            const store = Store.create(data);
            return res.status(200).json({ message: "Thêm mới thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Không thể tạo cơ sở" });
        }
    };
    updateStore = async (req, res) => {
        const data = req.body;
        if (!data.id) {
            res.status(422).json({ message: "Cơ sở không tồn tại" });
        }
        try {
            await Store.update(
                data,
                { where: { id: data.id } }
            );
            if (data.userId) {

            }
            return res.status(200).json({ message: 'Cập nhật thành công' });
        } catch (error) {
            return res.status(500).json({ message: "Không thể cập nhật cơ sở", data: JSON.stringify(error) });
        }

    };
    activeDeactive = async (req, res) => {
        const data = req.body;
        if (!data.id) {
            res.status(422).json({ message: "Cơ sở không tồn tại" });
        }
        try {
            const store = await Store.findOne({ where: { id: data.id } });
            if (!store) {
                res.status(422).json({ message: "Cơ sở không tồn tại" });
            }
            if (store.active) {
                store.update({
                    active: false
                })
            } else {
                store.update({
                    active: true
                })
            }
            return res.status(200).json({message: 'Thành công'});
        } catch (error) {
            return res.status(500).json({ message: "Không thực hiện", data: JSON.stringify(error) });
        }
    }
}

module.exports = new StoreController();
