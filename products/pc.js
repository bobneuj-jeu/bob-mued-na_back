// productController.js
const productService = require('./productService'); // 제품 서비스 가져오기

// 제품 추가
const createProduct = async (req, res) => {
    try {
        const product = await productService.addProduct(req.body); // 제품 추가
        res.status(201).json(product); // 성공적으로 추가된 제품 반환
    } catch (error) {
        res.status(500).json({ message: error.message }); // 에러 발생 시 메시지 반환
    }
};

// 제품 목록 조회
const getProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts(); // 모든 제품 조회
        res.status(200).json(products); // 제품 목록 반환
    } catch (error) {
        res.status(500).json({ message: error.message }); // 에러 발생 시 메시지 반환
    }
};

// 특정 제품 조회
const getProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id); // 제품 ID로 조회
        if (!product) {
            return res.status(404).json({ message: '제품을 찾을 수 없습니다.' }); // 제품이 없을 경우 메시지 반환
        }
        res.status(200).json(product); // 제품 반환
    } catch (error) {
        res.status(500).json({ message: error.message }); // 에러 발생 시 메시지 반환
    }
};

// 제품 수정
const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body); // 제품 수정
        if (!product) {
            return res.status(404).json({ message: '제품을 찾을 수 없습니다.' }); // 제품이 없을 경우 메시지 반환
        }
        res.status(200).json(product); // 수정된 제품 반환
    } catch (error) {
        res.status(500).json({ message: error.message }); // 에러 발생 시 메시지 반환
    }
};

// 제품 삭제
const deleteProduct = async (req, res) => {
    try {
        const product = await productService.deleteProduct(req.params.id); // 제품 삭제
        if (!product) {
            return res.status(404).json({ message: '제품을 찾을 수 없습니다.' }); // 제품이 없을 경우 메시지 반환
        }
        res.status(204).send(); // 성공적으로 삭제된 경우
    } catch (error) {
        res.status(500).json({ message: error.message }); // 에러 발생 시 메시지 반환
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
};