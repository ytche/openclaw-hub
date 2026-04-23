/**
 * 测试脚本：验证513050
 * 
 * 用法：node test-513050.js
 */

const { calculateGridStrategy } = require('./grid-calculator.js');

console.log("=== 测试案例：513050.SH (中概互联网ETF) ===\n");

const result513050 = calculateGridStrategy({
    symbol: "513050.SH",
    currentPrice: 1.200,  // 假设基准价
    totalBudget: 47000,   // 4.7万预算
    existingShares: 0,
    existingCost: 0,
    permanentShares: 0,
    volatilityLevel: "medium",
    largeGridDepth: "auto",
});

if (result513050.error) {
    console.error("错误:", result513050.error);
} else {
    console.log("波动等级:", result513050.volatilityLevel);
    console.log("大网深度:", result513050.largeGridDepth);
    console.log("小网档数:", result513050.grids.small.length);
    console.log("小网合计:", result513050.capitalAllocation.small);
    console.log("中网合计:", result513050.capitalAllocation.medium);
    console.log("大网合计:", result513050.capitalAllocation.large);
    console.log("总投入:", result513050.capitalAllocation.total);
    console.log("冗余:", result513050.stressTest.reserve, "(", result513050.stressTest.reservePct + "%", ")");
    console.log("压力测试通过:", result513050.stressTest.pass);
    
    console.log("\n--- 小网档位 ---");
    console.log("档位 | 买入价 | 股数 | 金额 | 留利 | 卖出触发");
    console.log("-----|--------|------|------|------|----------");
    
    for (const tier of result513050.grids.small) {
        console.log(
            `S${tier.tier} |`,
            `${tier.buyPrice.toFixed(3)} |`,
            `${tier.shares} |`,
            `${tier.cost.toFixed(0)} |`,
            `${tier.keepShares} |`,
            `${tier.sellTrigger.toFixed(3)}`
        );
    }
    
    console.log("\n--- 中网档位 ---");
    for (const tier of result513050.grids.medium) {
        console.log(
            `${tier.tier} |`,
            `${tier.buyPrice.toFixed(3)} |`,
            `${tier.shares} |`,
            `${tier.cost.toFixed(0)}`
        );
    }
    
    console.log("\n--- 大网档位 ---");
    for (const tier of result513050.grids.large) {
        console.log(
            `${tier.tier} |`,
            `${tier.buyPrice.toFixed(3)} |`,
            `${tier.shares} |`,
            `${tier.cost.toFixed(0)}`
        );
    }
    
    console.log("\n--- 收益测算 ---");
    console.log("交易利润:", result513050.returnEstimate.tradingProfit.toFixed(0));
    console.log("留利股数:", result513050.returnEstimate.keepShares);
    console.log("留利浮盈:", result513050.returnEstimate.unrealized.toFixed(0));
    console.log("总回报:", result513050.returnEstimate.totalReturn.toFixed(0));
    console.log("收益率:", result513050.returnEstimate.roiPct + "%");
}
