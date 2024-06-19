const { NotFoundError } = require("../core/error.response");
const commentModel = require("../models/comment.model");
const { findProductById } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");


/*
    key features: Comment services
    + add comment [User | Shop]
    + get a list a of comment  [User | Shop]
    + delete a comment  [User | Shop | Admin]
*/
class CommentService {
    static async createComment({ productId, userId, content, parentCommentId = null }) {
        const comment = new commentModel({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId
        })

        let rightValue
        if (parentCommentId) {
            //reply comment
            const parentComment = await commentModel.findById(parentCommentId)
            if (!parentComment) throw new NotFoundError('Parent comment not found')

            rightValue = parentComment.comment_right
            // updateMany Comments

            await commentModel.updateMany({
                comment_productId: convertToObjectIdMongodb(productId),
                comment_right: { $gte: rightValue }
            }, {
                $inc: { comment_right: 2 }
            })

            await commentModel.updateMany({
                comment_productId: convertToObjectIdMongodb(productId),
                comment_left: { $gte: rightValue }
            }, {
                $inc: { comment_left: 2 }
            })
        } else {
            const maxRightValue = await commentModel.findOne({
                comment_productId: convertToObjectIdMongodb(productId),
            }, 'comment_right', { sort: { comment_right: -1 } })
            if (maxRightValue) {
                rightValue = maxRightValue.right + 1
            } else {
                rightValue = 1
            }
        }

        // insert to comment
        comment.comment_left = rightValue
        comment.comment_right = rightValue + 1

        await comment.save()
        return comment
    }

    static async getCommentsByParentId({ productId, parentCommentId = null, limit = 50, offset = 0 }) {
        if (parentCommentId) {
            const parent = await commentModel.findById(parentCommentId)
            if (!parent) throw new NotFoundError('Not found comment for product')

            const comments = await commentModel.find({
                comment_productId: convertToObjectIdMongodb(productId),
                comment_left: { $gt: parent.comment_left },
                comment_right: { $lte: parent.comment_right }
            }).select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1
            }).sort({
                comment_left: 1
            })

            return comments
        }

        const comments = await commentModel.find({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_parentId: parentCommentId
        }).select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parentId: 1
        }).sort({
            comment_left: 1
        })

        return comments
    }

    static async deleteComment({ commentId, productId }) {
        //Check the product exists in the database
        const foundProduct = await findProductById({
            product_id: productId
        })

        if (!foundProduct) throw new NotFoundError('Product not found')

        //1. Xác định giá trị left và right of commentId
        const comment = await commentModel.findById(commentId)
        if (!comment) throw new NotFoundError('Product not found')

        const leftValue = comment.comment_left
        const rightValue = comment.comment_right

        //2. tinh width 
        const width = rightValue - leftValue + 1
        //3. Xoa tat ca commentId con 
        await commentModel.deleteMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_left: { $gte: leftValue, $lte: rightValue }
        })
        //4. Cap nhat gia tri left va right con lai
        await commentModel.updateMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_right: { $gt: rightValue }
        }, {
            $inc: { comment_right: -width }
        })

        await commentModel.updateMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_left: { $gt: rightValue }
        }, {
            $inc: { comment_left: -width }
        })

        return true
    }
}

module.exports = CommentService