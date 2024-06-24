const users = [
	{ id: 0, name: 'Umi', nickName: 'U', gender: 'MALE' },
	{ id: 1, name: 'Fish', nickName: 'B', gender: 'FEMALE' },
];

export default {
	'GET /api/v1/queryUserList': (req: any, res: any) => {
		res.json({
			success: true,
			data: { list: users },
			errorCode: 0,
		});
	},
	'PUT /api/v1/user/': (req: any, res: any) => {
		res.json({
			success: true,
			errorCode: 0,
		});
	},
	'GET /api/v1/test': (req: any, res: any) => {
		res.json({
			success: true,
			data: { name: 'Umi', age: 18, address: 'Beijing', hobbies: ['reading', 'swimming'], friends: [{ name: 'Fish', age: 18, address: 'Beijing' }] },
			errorCode: 0,
		});
	},
};
