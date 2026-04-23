/**
 * 网格策略生成器 - UI控制器
 * 
 * 与凝光的grid-calculator.js配合
 * 纯前端，无框架依赖
 */

// 存储当前结果和覆盖状态
let currentResult = null;
let manualOverrides = {}; // { 'small_0': 1500, 'medium_1': 2000 }

// 波动等级说明
const VOLATILITY_DESC = {
    'auto': '自动检测（基于ETF代码）',
    'low': '低波动（宽基指数：沪深300、中证500等）',
    'medium': '中波动（跨境指数：中概、纳指等）',
    'high': '高波动（行业ETF：券商、有色、军工等）'
};

// ETF代码自动识别映射
const ETF_MAP = {
    '510300': { name: '沪深300ETF', level: 'low' },
    '510500': { name: '中证500ETF', level: 'low' },
    '159915': { name: '创业板ETF', level: 'low' },
    '510050': { name: '上证50ETF', level: 'low' },
    '512000': { name: '券商ETF', level: 'high' },
    '512690': { name: '有色ETF', level: 'high' },
    '512660': { name: '军工ETF', level: 'high' },
    '513050': { name: '中概互联网ETF', level: 'medium' },
    '513100': { name: '纳指ETF', level: 'medium' },
    '159941': { name: '中概科技ETF', level: 'medium' },
};

document.addEventListener('DOMContentLoaded', function() {
    // 绑定事件
    document.getElementById('calculateBtn').addEventListener('click', calculateAndDisplay);
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('exportMdBtn').addEventListener('click', exportToMarkdown);
    document.getElementById('symbol').addEventListener('blur', autoDetectETF);
    
    // 默认加载512000示例
    loadExample();
});

/**
 * 自动检测ETF信息
 */
function autoDetectETF() {
    const symbol = document.getElementById('symbol').value.trim();
    if (!symbol) return;
    
    const code = symbol.split('.')[0];
    const info = ETF_MAP[code];
    
    if (info) {
        document.getElementById('etfName').textContent = info.name;
        document.getElementById('volatility').value = info.level;
        showVolatilityDesc();
    } else {
        document.getElementById('etfName').textContent = '未识别ETF';
    }
}

/**
 * 显示波动等级说明
 */
function showVolatilityDesc() {
    const level = document.getElementById('volatility').value;
    document.getElementById('volatilityDesc').textContent = VOLATILITY_DESC[level] || '';
}

/**
 * 加载示例数据（512000）
 */
function loadExample() {
    document.getElementById('symbol').value = '512000.SH';
    document.getElementById('currentPrice').value = '0.514';
    document.getElementById('totalBudget').value = '20000';
    document.getElementById('existingShares').value = '1400';
    document.getElementById('existingCost').value = '0';
    document.getElementById('permanentShares').value = '1400';
    document.getElementById('volatility').value = 'high';
    document.getElementById('largeGridDepth').value = 'auto';
    
    autoDetectETF();
}

/**
 * 执行计算并显示结果
 */
function calculateAndDisplay() {
    try {
        const params = {
            symbol: document.getElementById('symbol').value.trim(),
            currentPrice: parseFloat(document.getElementById('currentPrice').value),
            totalBudget: parseFloat(document.getElementById('totalBudget').value),
            existingShares: parseInt(document.getElementById('existingShares').value) || 0,
            existingCost: parseFloat(document.getElementById('existingCost').value) || 0,
            permanentShares: parseInt(document.getElementById('permanentShares').value) || 0,
            volatilityLevel: document.getElementById('volatility').value,
            largeGridDepth: document.getElementById('largeGridDepth').value,
        };
        
        // 验证输入
        if (!params.symbol || isNaN(params.currentPrice) || isNaN(params.totalBudget)) {
            alert('请填写ETF代码、基准价和总预算');
            return;
        }
        
        if (params.currentPrice <= 0 || params.totalBudget <= 0) {
            alert('价格必须大于0');
            return;
        }
        
        // 重置手动覆盖
        manualOverrides = {};
        
        // 调用计算引擎
        const result = calculateGridStrategy(params);
        
        if (result.error) {
            alert(result.error);
            return;
        }
        
        currentResult = result;
        
        // 显示结果
        displayResults(result);
        
    } catch (e) {
        console.error('计算错误:', e);
        alert('计算出错: ' + e.message);
    }
}

/**
 * 显示计算结果
 */
function displayResults(result) {
    // 显示结果区域
    document.getElementById('results').style.display = 'block';
    
    // 基本信息
    document.getElementById('resSymbol').textContent = result.symbol;
    document.getElementById('resBasePrice').textContent = result.basePrice.toFixed(3);
    document.getElementById('resBudget').textContent = result.totalBudget.toLocaleString();
    document.getElementById('resVolatility').textContent = 
        result.volatilityLevel === 'high' ? '高波动' : 
        result.volatilityLevel === 'medium' ? '中波动' : '低波动';
    document.getElementById('resDepth').textContent = (result.largeGridDepth * 100).toFixed(0) + '%';
    
    // 渲染三网表格
    renderGridTable('small', result.grids.small, result.basePrice);
    renderGridTable('medium', result.grids.medium, result.basePrice);
    renderGridTable('large', result.grids.large, result.basePrice);
    
    // 更新汇总
    updateSummary();
}

/**
 * 渲染网格表格（带手动覆盖功能）
 */
function renderGridTable(gridType, tiers, basePrice) {
    const tableBody = document.getElementById(gridType + 'GridTable');
    tableBody.innerHTML = '';
    
    tiers.forEach((tier, index) => {
        const overrideKey = `${gridType}_${index}`;
        const isOverridden = manualOverrides.hasOwnProperty(overrideKey);
        const shares = isOverridden ? manualOverrides[overrideKey] : tier.shares;
        
        // 重新计算该档数据
        const buyPrice = tier.buyPrice;
        const cost = buyPrice * shares;
        
        let sellTrigger, sellShares, keepShares, profit;
        
        if (gridType === 'small') {
            keepShares = tier.keepShares;
            sellShares = shares - keepShares;
            sellTrigger = index === 0 ? basePrice : tiers[index - 1].buyPrice;
            profit = (sellTrigger - buyPrice) * sellShares;
        } else {
            sellShares = shares;
            keepShares = '-';
            sellTrigger = index === 0 ? basePrice : tiers[index - 1].buyPrice;
            profit = (sellTrigger - buyPrice) * shares;
        }
        
        const row = document.createElement('tr');
        if (isOverridden) row.classList.add('overridden');
        
        row.innerHTML = `
            <td>${gridType === 'small' ? 'S' + tier.tier : tier.tier}</td>
            <td>${buyPrice.toFixed(3)}</td>
            <td class="shares-cell">
                <input type="number" 
                       class="shares-input" 
                       value="${shares}" 
                       step="100"
                       min="100"
                       data-grid="${gridType}"
                       data-index="${index}"
                       data-original="${tier.shares}"
                       onchange="handleSharesChange(this)">
            </td>
            <td>${cost.toFixed(0)}</td>
            <td>${sellTrigger.toFixed(3)}</td>
            <td>${sellShares}</td>
            <td>${keepShares}</td>
            <td class="profit">${profit.toFixed(0)}</td>
            <td>
                ${isOverridden ? `<button class="btn-reset" onclick="resetTier('${gridType}', ${index})">重置</button>` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * 处理股数手动修改
 */
function handleSharesChange(input) {
    const gridType = input.dataset.grid;
    const index = parseInt(input.dataset.index);
    const originalShares = parseInt(input.dataset.original);
    const newShares = parseInt(input.value);
    
    if (isNaN(newShares) || newShares < 100) {
        alert('股数必须大于等于100');
        input.value = originalShares;
        return;
    }
    
    // 向上取整到100的倍数
    const roundedShares = Math.ceil(newShares / 100) * 100;
    input.value = roundedShares;
    
    if (roundedShares === originalShares) {
        // 恢复自动计算
        delete manualOverrides[`${gridType}_${index}`];
    } else {
        // 记录覆盖
        manualOverrides[`${gridType}_${index}`] = roundedShares;
    }
    
    // 重新渲染并更新汇总
    displayResults(currentResult);
}

/**
 * 重置单档为自动计算
 */
function resetTier(gridType, index) {
    delete manualOverrides[`${gridType}_${index}`];
    displayResults(currentResult);
}

/**
 * 更新汇总数据
 */
function updateSummary() {
    if (!currentResult) return;
    
    // 计算实际投入（考虑手动覆盖）
    let smallTotal = 0, mediumTotal = 0, largeTotal = 0;
    
    currentResult.grids.small.forEach((tier, i) => {
        const key = `small_${i}`;
        const shares = manualOverrides.hasOwnProperty(key) ? manualOverrides[key] : tier.shares;
        smallTotal += tier.buyPrice * shares;
    });
    
    currentResult.grids.medium.forEach((tier, i) => {
        const key = `medium_${i}`;
        const shares = manualOverrides.hasOwnProperty(key) ? manualOverrides[key] : tier.shares;
        mediumTotal += tier.buyPrice * shares;
    });
    
    currentResult.grids.large.forEach((tier, i) => {
        const key = `large_${i}`;
        const shares = manualOverrides.hasOwnProperty(key) ? manualOverrides[key] : tier.shares;
        largeTotal += tier.buyPrice * shares;
    });
    
    const total = smallTotal + mediumTotal + largeTotal;
    const reserve = currentResult.totalBudget - total;
    const reservePct = reserve / currentResult.totalBudget;
    
    // 资金分配
    document.getElementById('capitalSmall').textContent = smallTotal.toFixed(0);
    document.getElementById('capitalMedium').textContent = mediumTotal.toFixed(0);
    document.getElementById('capitalLarge').textContent = largeTotal.toFixed(0);
    document.getElementById('capitalTotal').textContent = total.toFixed(0);
    document.getElementById('capitalReserve').textContent = reserve.toFixed(0);
    
    // 压力测试
    document.getElementById('stressSmall').textContent = (smallTotal / currentResult.totalBudget * 100).toFixed(1) + '%';
    document.getElementById('stressMedium').textContent = ((smallTotal + mediumTotal) / currentResult.totalBudget * 100).toFixed(1) + '%';
    document.getElementById('stressWorst').textContent = (total / currentResult.totalBudget * 100).toFixed(1) + '%';
    document.getElementById('stressReserve').textContent = (reservePct * 100).toFixed(1) + '%';
    
    const pass = reservePct >= 0.10 && reservePct <= 0.30;
    document.getElementById('stressPass').textContent = pass ? '✅ 通过' : '⚠️ 冗余不足';
    document.getElementById('stressPass').className = pass ? 'pass' : 'fail';
    
    // 重新计算收益
    const returns = calculateReturnsWithOverrides(currentResult);
    document.getElementById('returnTrading').textContent = returns.tradingProfit.toFixed(0);
    document.getElementById('returnKeep').textContent = returns.keepShares;
    document.getElementById('returnUnrealized').textContent = returns.unrealized.toFixed(0);
    document.getElementById('returnTotal').textContent = returns.totalReturn.toFixed(0);
    document.getElementById('returnROI').textContent = returns.roiPct + '%';
    
    // 重绘饼图
    drawPieChart({ small: smallTotal, medium: mediumTotal, large: largeTotal, reserve: reserve, total: total });
}

/**
 * 考虑手动覆盖后的收益计算
 */
function calculateReturnsWithOverrides(result) {
    let tradingProfit = 0;
    let keepShares = 0;
    let keepCost = 0;
    let totalCost = 0;
    
    // 小网收益
    result.grids.small.forEach((tier, i) => {
        const key = `small_${i}`;
        const shares = manualOverrides.hasOwnProperty(key) ? manualOverrides[key] : tier.shares;
        const buyPrice = tier.buyPrice;
        const sellTrigger = i === 0 ? result.basePrice : result.grids.small[i - 1].buyPrice;
        const keep = tier.keepShares;
        const sell = shares - keep;
        
        tradingProfit += (sellTrigger - buyPrice) * sell;
        keepShares += keep;
        keepCost += buyPrice * keep;
        totalCost += buyPrice * shares;
    });
    
    // 中网收益
    result.grids.medium.forEach((tier, i) => {
        const key = `medium_${i}`;
        const shares = manualOverrides.hasOwnProperty(key) ? manualOverrides[key] : tier.shares;
        const buyPrice = tier.buyPrice;
        const sellTrigger = i === 0 ? result.basePrice : result.grids.medium[i - 1].buyPrice;
        
        tradingProfit += (sellTrigger - buyPrice) * shares;
        totalCost += buyPrice * shares;
    });
    
    // 大网收益
    result.grids.large.forEach((tier, i) => {
        const key = `large_${i}`;
        const shares = manualOverrides.hasOwnProperty(key) ? manualOverrides[key] : tier.shares;
        const buyPrice = tier.buyPrice;
        const sellTrigger = i === 0 ? result.basePrice : result.grids.large[i - 1].buyPrice;
        
        tradingProfit += (sellTrigger - buyPrice) * shares;
        totalCost += buyPrice * shares;
    });
    
    const avgKeepCost = keepShares > 0 ? keepCost / keepShares : 0;
    const unrealized = keepShares * (result.basePrice - avgKeepCost);
    
    return {
        tradingProfit: Math.round(tradingProfit * 100) / 100,
        keepShares: keepShares,
        keepCost: Math.round(avgKeepCost * 1000) / 1000,
        unrealized: Math.round(unrealized * 100) / 100,
        totalReturn: Math.round((tradingProfit + unrealized) * 100) / 100,
        roiPct: Math.round((tradingProfit + unrealized) / totalCost * 1000) / 10,
    };
}

/**
 * 绘制资金分配饼图
 */
function drawPieChart(allocation) {
    const canvas = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    ctx.clearRect(0, 0, width, height);
    
    const data = [
        { label: '小网', value: allocation.small, color: '#4CAF50' },
        { label: '中网', value: allocation.medium, color: '#2196F3' },
        { label: '大网', value: allocation.large, color: '#FF9800' },
        { label: '冗余', value: allocation.reserve, color: '#9E9E9E' },
    ];
    
    const total = allocation.total;
    let currentAngle = -Math.PI / 2;
    
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const pct = ((item.value / total) * 100).toFixed(1);
        ctx.fillText(`${item.label}`, labelX, labelY - 8);
        ctx.fillText(`${pct}%`, labelX, labelY + 8);
        
        currentAngle += sliceAngle;
    });
    
    const legendY = height - 20;
    let legendX = 20;
    
    data.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY - 8, 12, 12);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, legendX + 18, legendY);
        legendX += 60;
    });
}

/**
 * 导出为CSV
 */
function exportToCSV() {
    const symbol = document.getElementById('resSymbol').textContent;
    if (!symbol) {
        alert('请先执行计算');
        return;
    }
    
    let csv = '档位,买入价,股数,金额,卖出触发,出股数,留利股,单笔利润\n';
    
    document.querySelectorAll('#smallGridTable tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        csv += `小网${cells[0].textContent},${cells[1].textContent},${cells[2].querySelector('input')?.value || cells[2].textContent},${cells[3].textContent},${cells[4].textContent},${cells[5].textContent},${cells[6].textContent},${cells[7].textContent}\n`;
    });
    
    document.querySelectorAll('#mediumGridTable tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        csv += `中网${cells[0].textContent},${cells[1].textContent},${cells[2].querySelector('input')?.value || cells[2].textContent},${cells[3].textContent},${cells[4].textContent},${cells[5].textContent},${cells[6].textContent},${cells[7].textContent}\n`;
    });
    
    document.querySelectorAll('#largeGridTable tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        csv += `大网${cells[0].textContent},${cells[1].textContent},${cells[2].querySelector('input')?.value || cells[2].textContent},${cells[3].textContent},${cells[4].textContent},${cells[5].textContent},${cells[6].textContent},${cells[7].textContent}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${symbol}_grid_plan.csv`;
    link.click();
}

/**
 * 导出为Markdown（凝光文档格式）
 */
function exportToMarkdown() {
    const symbol = document.getElementById('resSymbol').textContent;
    if (!symbol) {
        alert('请先执行计算');
        return;
    }
    
    const basePrice = document.getElementById('resBasePrice').textContent;
    const budget = document.getElementById('resBudget').textContent;
    const volatility = document.getElementById('resVolatility').textContent;
    const depth = document.getElementById('resDepth').textContent;
    
    let md = `# ${symbol} 网格策略方案\n\n`;
    md += `**生成时间:** ${new Date().toLocaleString()}\n\n`;
    
    md += `## 基本信息\n\n`;
    md += `- ETF代码: ${symbol}\n`;
    md += `- 基准价: ${basePrice}元\n`;
    md += `- 总预算: ${budget}元\n`;
    md += `- 波动等级: ${volatility}\n`;
    md += `- 大网深度: ${depth}\n\n`;
    
    md += `## 资金分配\n\n`;
    md += `- 小网: ${document.getElementById('capitalSmall').textContent}元\n`;
    md += `- 中网: ${document.getElementById('capitalMedium').textContent}元\n`;
    md += `- 大网: ${document.getElementById('capitalLarge').textContent}元\n`;
    md += `- 总投入: ${document.getElementById('capitalTotal').textContent}元\n`;
    md += `- 冗余资金: ${document.getElementById('capitalReserve').textContent}元\n\n`;
    
    md += `## 小网策略\n\n`;
    md += `| 档位 | 买入价 | 股数 | 金额 | 卖出触发 | 出股数 | 留利股 | 单笔利润 |\n`;
    md += `|------|--------|------|------|----------|--------|--------|----------|\n`;
    
    document.querySelectorAll('#smallGridTable tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        const shares = cells[2].querySelector('input')?.value || cells[2].textContent;
        md += `| S${cells[0].textContent} | ${cells[1].textContent} | ${shares} | ${cells[3].textContent} | ${cells[4].textContent} | ${cells[5].textContent} | ${cells[6].textContent} | ${cells[7].textContent} |\n`;
    });
    
    md += `\n## 中网策略\n\n`;
    md += `| 档位 | 买入价 | 股数 | 金额 | 卖出触发 | 单笔利润 |\n`;
    md += `|------|--------|------|------|----------|----------|\n`;
    
    document.querySelectorAll('#mediumGridTable tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        const shares = cells[2].querySelector('input')?.value || cells[2].textContent;
        md += `| ${cells[0].textContent} | ${cells[1].textContent} | ${shares} | ${cells[3].textContent} | ${cells[4].textContent} | ${cells[7].textContent} |\n`;
    });
    
    md += `\n## 大网策略\n\n`;
    md += `| 档位 | 买入价 | 股数 | 金额 | 卖出触发 | 单笔利润 |\n`;
    md += `|------|--------|------|------|----------|----------|\n`;
    
    document.querySelectorAll('#largeGridTable tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        const shares = cells[2].querySelector('input')?.value || cells[2].textContent;
        md += `| ${cells[0].textContent} | ${cells[1].textContent} | ${shares} | ${cells[3].textContent} | ${cells[4].textContent} | ${cells[7].textContent} |\n`;
    });
    
    md += `\n## 压力测试\n\n`;
    md += `- 小网触发: ${document.getElementById('stressSmall').textContent}\n`;
    md += `- 中网触发: ${document.getElementById('stressMedium').textContent}\n`;
    md += `- 大网触发: ${document.getElementById('stressWorst').textContent}\n`;
    md += `- 冗余比例: ${document.getElementById('stressReserve').textContent}\n`;
    md += `- 测试结果: ${document.getElementById('stressPass').textContent}\n\n`;
    
    md += `## 收益测算\n\n`;
    md += `- 交易利润: ${document.getElementById('returnTrading').textContent}元\n`;
    md += `- 留利股数: ${document.getElementById('returnKeep').textContent}股\n`;
    md += `- 留利浮盈: ${document.getElementById('returnUnrealized').textContent}元\n`;
    md += `- 总回报: ${document.getElementById('returnTotal').textContent}元\n`;
    md += `- 收益率: ${document.getElementById('returnROI').textContent}\n\n`;
    
    md += `---\n*由凝光通用网格策略框架生成*\n`;
    
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${symbol}_grid_plan.md`;
    link.click();
}
