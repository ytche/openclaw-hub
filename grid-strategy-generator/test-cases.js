/**
 * 测试脚本：验证512000和513050
 * 
 * 用法：node test-cases.js
 */

const { calculateGridStrategy } = require('./grid-calculator.js');

console.log("=== 测试案例：512000.SH ===\n");

const result512000 = calculateGridStrategy({
    symbol: "512000.SH",
    currentPrice: 0.514,
    totalBudget: 20000,
    existingShares: 1400,
    existingCost: 0,
    permanentShares: 1400,
    volatilityLevel: "high",
    largeGridDepth: "auto",
});

if (result512000.error) {
    console.error("错误:", result512000.error);
} else {
    console.log("波动等级:", result512000.volatilityLevel);
    console.log("大网深度:", result512000.largeGridDepth);
    console.log("小网档数:", result512000.grids.small.length);
    console.log("小网合计:", result512000.capitalAllocation.small);
    console.log("中网合计:", result512000.capitalAllocation.medium);
    console.log("大网合计:", result512000.capitalAllocation.large);
    console.log("总投入:", result512000.capitalAllocation.total);
    console.log("冗余:", result512000.stressTest.reserve, "(", result512000.stressTest.reservePct + "%", ")");
    console.log("压力测试通过:", result512000.stressTest.pass);
    
    console.log("\n--- 小网档位对比 ---");
    console.log("期望: 11档, 合计8574");
    console.log("实际:", result512000.grids.small.length, "档, 合计", result512000.capitalAllocation.small);
    
    console.log("\n档位详情:");
    console.log("档位 | 买入价 | 股数 | 金额 | 留利 | 卖出触发 | 利润");
    console.log("-----|--------|------|------|------|----------|------");
    
    const expected512000 = [
        { tier: 1, buyPrice: 0.488, shares: 1000, cost: 488, keep: 100, sellTrigger: 0.514 },
        { tier: 2, buyPrice: 0.463, shares: 1100, cost: 509, keep: 100, sellTrigger: 0.488 },
        { tier: 3, buyPrice: 0.439, shares: 1200, cost: 527, keep: 100, sellTrigger: 0.463 },
        { tier: 4, buyPrice: 0.411, shares: 1400, cost: 575, keep: 200, sellTrigger: 0.439 },
        { tier: 5, buyPrice: 0.386, shares: 1600, cost: 618, keep: 200, sellTrigger: 0.411 },
        { tier: 6, buyPrice: 0.360, shares: 1800, cost: 648, keep: 200, sellTrigger: 0.386 },
        { tier: 7, buyPrice: 0.334, shares: 2200, cost: 735, keep: 400, sellTrigger: 0.360 },
        { tier: 8, buyPrice: 0.308, shares: 2600, cost: 801, keep: 400, sellTrigger: 0.334 },
        { tier: 9, buyPrice: 0.283, shares: 3000, cost: 849, keep: 400, sellTrigger: 0.308 },
        { tier: 10, buyPrice: 0.257, shares: 3500, cost: 900, keep: 500, sellTrigger: 0.283 },
        { tier: 11, buyPrice: 0.231, shares: 4000, cost: 924, keep: 500, sellTrigger: 0.257 },
    ];
    
    for (let i = 0; i < Math.max(result512000.grids.small.length, expected512000.length); i++) {
        const actual = result512000.grids.small[i] || {};
        const expected = expected512000[i] || {};
        
        const matchPrice = Math.abs(actual.buyPrice - expected.buyPrice) < 0.001;
        const matchShares = actual.shares === expected.shares;
        const matchKeep = actual.keepShares === expected.keep;
        const matchSell = Math.abs(actual.sellTrigger - expected.sellTrigger) < 0.001;
        
        const status = matchPrice && matchShares && matchKeep && matchSell ? "✅" : "❌";
        
        console.log(
            `S${i+1} ${status} |`,
            `${actual.buyPrice || '-'} (${expected.buyPrice || '-'}) |`,
            `${actual.shares || '-'} (${expected.shares || '-'}) |`,
            `${Math.round(actual.cost || 0)} (${expected.cost || '-'}) |`,
            `${actual.keepShares || '-'} (${expected.keep || '-'}) |`,
            `${actual.sellTrigger || '-'} (${expected.sellTrigger || '-'})`
        );
    }
    
    console.log("\n--- 中网档位对比 ---");
    console.log("期望: 3档, 合计2905");
    console.log("实际:", result512000.grids.medium.length, "档, 合计", result512000.capitalAllocation.medium);
    
    const expectedMedium = [
        { tier: "M1", buyPrice: 0.437, shares: 2000, cost: 874 },
        { tier: "M2", buyPrice: 0.371, shares: 2500, cost: 928 },
        { tier: "M3", buyPrice: 0.315, shares: 3500, cost: 1103 },
    ];
    
    for (let i = 0; i < Math.max(result512000.grids.medium.length, expectedMedium.length); i++) {
        const actual = result512000.grids.medium[i] || {};
        const expected = expectedMedium[i] || {};
        
        const matchPrice = Math.abs(actual.buyPrice - expected.buyPrice) < 0.001;
        const matchShares = actual.shares === expected.shares;
        
        const status = matchPrice && matchShares ? "✅" : "❌";
        console.log(`${actual.tier || '-'} ${status} | 买入价: ${actual.buyPrice || '-'} (${expected.buyPrice || '-'}) | 股数: ${actual.shares || '-'} (${expected.shares || '-'})`);
    }
    
    console.log("\n--- 大网档位对比 ---");
    console.log("期望: 2档, 合计4250, 深度25%");
    console.log("实际:", result512000.grids.large.length, "档, 合计", result512000.capitalAllocation.large, ", 深度", result512000.largeGridDepth);
    
    const expectedLarge = [
        { tier: "L1", buyPrice: 0.386, shares: 5000, cost: 1930 },
        { tier: "L2", buyPrice: 0.290, shares: 8000, cost: 2320 },
    ];
    
    for (let i = 0; i < Math.max(result512000.grids.large.length, expectedLarge.length); i++) {
        const actual = result512000.grids.large[i] || {};
        const expected = expectedLarge[i] || {};
        
        const matchPrice = Math.abs(actual.buyPrice - expected.buyPrice) < 0.001;
        const matchShares = actual.shares === expected.shares;
        
        const status = matchPrice && matchShares ? "✅" : "❌";
        console.log(`${actual.tier || '-'} ${status} | 买入价: ${actual.buyPrice || '-'} (${expected.buyPrice || '-'}) | 股数: ${actual.shares || '-'} (${expected.shares || '-'})`);
    }
    
    console.log("\n--- 收益测算对比 ---");
    console.log("期望: 交易利润2446, 总回报4039, ROI 25.7%");
    console.log("实际: 交易利润", result512000.returnEstimate.tradingProfit, ", 总回报", result512000.returnEstimate.totalReturn, ", ROI", result512000.returnEstimate.roiPct + "%");
}

console.log("\n\n=== 测试案例：513050 ===\n");
// 513050需要更复杂的参数，先做个简化测试
// TODO: 读取513050完整数据后补充
