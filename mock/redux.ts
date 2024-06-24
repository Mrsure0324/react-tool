
export default {
	'GET /api/v1/redux/value': (req: any, res: any) => {
		res.json({
			success: true,
			data: 100,
			errorCode: 0,
		});
	},
};
