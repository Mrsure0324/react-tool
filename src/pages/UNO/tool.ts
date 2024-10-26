export function bestWealthDistribution(data:any[]) {
    // 1. 将数据分为赢钱和输钱两组
    const winners = data.filter(item => item.point > 0);
    const losers = data.filter(item => item.point < 0);

    // 2. 对赢钱组和输钱组分别排序，赢钱组从高到低，输钱组从低到高
    winners.sort((a, b) => b.point - a.point);
    losers.sort((a, b) => a.point - b.point);

    // 3. 初始化一个结果数组
    let result = [];

    // 4. 遍历赢钱组和输钱组，进行分配
    let loserIndex = 0; // 输钱组索引
    for (let i = 0; i < winners.length; i++) {
        let winner = winners[i];
        let currentWinnerPoint = winner.point;

        // 循环遍历输钱组，直到分配完当前赢钱者的点数
        while (currentWinnerPoint > 0 && loserIndex < losers.length) {
            let loser = losers[loserIndex];
            let currentLoserPoint = Math.abs(loser.point);

            // 如果输钱者的点数小于等于赢钱者剩余的点数
            if (currentLoserPoint <= currentWinnerPoint) {
                // 分配给输钱者
                result.push({
                    winner: winner.name,
                    loser: loser.name,
                    amount: currentLoserPoint, // 输钱者需要给赢钱者多少点数
                });
                currentWinnerPoint -= currentLoserPoint;
                loserIndex++;
            } else { // 输钱者的点数大于赢钱者剩余的点数
                // 分配赢钱者剩余的点数
                result.push({
                    winner: winner.name,
                    loser: loser.name,
                    amount: currentWinnerPoint,
                });
                // 更新输钱者的剩余点数
                loser.point += currentWinnerPoint;
                currentWinnerPoint = 0;
            }
        }
    }

    // 5. 返回结果数组
    return result;
}