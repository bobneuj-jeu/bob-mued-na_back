// productService.js
const Product = require('../models/Product'); // 제품 모델 가져오기

// 제품 추가
const addProduct = async (productData) => {
    // 제품 데이터를 데이터베이스에 추가하는 로직
    const newProduct = new Product(productData);
    await newProduct.save(); // 새로운 제품 저장
    return newProduct;
};

// 제품 목록 조회
const getAllProducts = async () => {
    // 모든 제품을 데이터베이스에서 조회하는 로직
    return await Product.find(); // 모든 제품 반환
};

// 특정 제품 조회
const getProductById = async (productId) => {
    // ID로 제품을 조회하는 로직
    return await Product.findById(productId); // 특정 제품 반환
};

// 제품 수정
const updateProduct = async (productId, updatedData) => {
    // 제품 정보를 수정하는 로직
    return await Product.findByIdAndUpdate(productId, updatedData, { new: true });
};

// 제품 삭제
const deleteProduct = async (productId) => {
    // 제품을 삭제하는 로직
    return await Product.findByIdAndDelete(productId); // 삭제된 제품 반환
};

module.exports = {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};