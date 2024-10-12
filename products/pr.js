// productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('./productController'); // 제품 컨트롤러 가져오기

// 제품 추가 라우트
router.post('/', productController.createProduct); // POST 요청: 제품 추가

// 제품 목록 조회 라우트
router.get('/', productController.getProducts); // GET 요청: 제품 목록 조회

// 특정 제품 조회 라우트
router.get('/:id', productController.getProduct); // GET 요청: 특정 제품 조회

// 제품 수정 라우트
router.put('/:id', productController.updateProduct); // PUT 요청: 제품 수정

// 제품 삭제 라우트
router.delete('/:id', productController.deleteProduct); // DELETE 요청: 제품 삭제

module.exports = router;