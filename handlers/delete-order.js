'use strict';

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const rp = require('minimal-request-promise');

const DELIVERY_API_URL =
    process.env.DELIVERY_API_URL ||
    'https://fake-delivery-api.effortlessserverless.com/delivery';

function deleteOrder(orderId) {
    return docClient
        .get({
            TableName: 'pizza-orders',
            Key: {
                orderId: orderId,
            },
        })
        .promise()
        .then(result => result.Item)
        .then(item => {
            if (item.orderStatus !== 'pending') {
                throw new Error('Order status is not pending');
            }

            return rp.delete(`${DELIVERY_API_URL}/${orderId}`, {
                headers: {
                    Authorization: 'aunt-marias-pizzeria-1234567890',
                    'Content-type': 'application/json',
                },
            });
        })
        .then(() => {
            return docClient
                .delete({
                    TableName: 'pizza-orders',
                    Key: {
                        orderId: orderId,
                    },
                })
                .promise();
        });
}

module.exports = deleteOrder;