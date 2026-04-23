/**
 * 网格策略生成器 - UI控制器
 * 
 * 与凝光的grid-calculator.js配合
 * 纯前端，无框架依赖
 */

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
        
        // 调用计算引擎
        const result = calculateGridStrategy(params);
        
        if (result.error) {
            alert(result.error);
            return;
        }
        
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
    
    // 小网表格
    const smallTable = document.getElementById('smallGridTable');
    smallTable.innerHTML = '';
    result.grids.small.forEach(tier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>S${tier.tier}</td>
            <td>${tier.buyPrice.toFixed(3)}</td>
            <td>${tier.shares}</td>
            <td>${tier.cost.toFixed(0)}</td>
            <td>${tier.sellTrigger.toFixed(3)}</td>
            <td>${tier.sellShares}</td>
            <td>${tier.keepShares}</td>
            <td class="profit">${tier.estimatedProfit.toFixed(0)}</td>
        `;
        smallTable.appendChild(row);
    });
    
    // 中网表格
    const mediumTable = document.getElementById('mediumGridTable');
    mediumTable.innerHTML = '';
    result.grids.medium.forEach(tier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tier.tier}</td>
            <td>${tier.buyPrice.toFixed(3)}</td>
            <td>${tier.shares}</td>
            <td>${tier.cost.toFixed(0)}</td>
            <td>${tier.sellTrigger.toFixed(3)}</td>
            <td>-</td>
            <td>-</td>
            <td class="profit">${tier.estimatedProfit.toFixed(0)}</td>
        `;
        mediumTable.appendChild(row);
    });
    
    // 大网表格
    const largeTable = document.getElementById('largeGridTable');
    largeTable.innerHTML = '';
    result.grids.large.forEach(tier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tier.tier}</td>
            <td>${tier.buyPrice.toFixed(3)}</td>
            <td>${tier.shares}</td>
            <td>${tier.cost.toFixed(0)}</td>
            <td>${tier.sellTrigger.toFixed(3)}</td>
            <td>-</td>
            <td>-</td>
            <td class="profit">${tier.estimatedProfit.toFixed(0)}</td>
        `;
        largeTable.appendChild(row);
    });
    
    // 资金分配
    document.getElementById('capitalSmall').textContent = result.capitalAllocation.small.toFixed(0);
    document.getElementById('capitalMedium').textContent = result.capitalAllocation.medium.toFixed(0);
    document.getElementById('capitalLarge').textContent = result.capitalAllocation.large.toFixed(0);
    document.getElementById('capitalTotal').textContent = result.capitalAllocation.total.toFixed(0);
    document.getElementById('capitalReserve').textContent = result.stressTest.reserve.toFixed(0);
    
    // 压力测试
    document.getElementById('stressSmall').textContent = result.stressTest.smallScenario.pct + '%';
    document.getElementById('stressMedium').textContent = result.stressTest.mediumScenario.pct + '%';
    document.getElementById('stressWorst').textContent = result.stressTest.worstScenario.pct + '%';
    document.getElementById('stressReserve').textContent = result.stressTest.reservePct + '%';
    document.getElementById('stressPass').textContent = result.stressTest.pass ? '✅ 通过' : '⚠️ 冗余不足';
    document.getElementById('stressPass').className = result.stressTest.pass ? 'pass' : 'fail';
    
    // 收益测算
    document.getElementById('returnTrading').textContent = result.returnEstimate.tradingProfit.toFixed(0);
    document.getElementById('returnKeep').textContent = result.returnEstimate.keepShares;
    document.getElementById('returnUnrealized').textContent = result.returnEstimate.unrealized.toFixed(0);
    document.getElementById('returnTotal').textContent = result.returnEstimate.totalReturn.toFixed(0);
    document.getElementById('returnROI').textContent = result.returnEstimate.roiPct + '%';
    
    // 绘制饼图
    drawPieChart(result.capitalAllocation);
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
    
    // 清空
    ctx.clearRect(0, 0, width, height);
    
    // 数据
    const data = [
        { label: '小网', value: allocation.small, color: '#4CAF50' },
        { label: '中网', value: allocation.medium, color: '#2196F3' },
        { label: '大网', value: allocation.large, color: '#FF9800' },
        { label: '冗余', value: allocation.reserve, color: '#9E9E9E' },
    ];
    
    const total = allocation.total;
    let currentAngle = -Math.PI / 2; // 从顶部开始
    
    // 绘制饼图
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        
        // 绘制边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制标签
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
    
    // 绘制图例
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
    
    md += `## 小网策略 (${document.getElementById('smallGridCount').textContent || 11}档)\n\n`;
    md += `| 档位 | 买入价 | 股数 | 金额 | 卖出触发 | 出股数 | 留利股 | 单笔利润 |\n`;
    md += `|------|--------|------|------|----------|--------|--------|----------|\n`;
    
    document.querySelectorAll('#smallGridTable tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        md += `| S${cells[0].textContent} | ${cells[1].textContent} | ${cells[2].textContent} | ${cells[3].textContent} | ${cells[4].textContent} | ${cells[5].textContent} | ${cells[6].textContent} | ${cells[7].textContent} |\n`;
    });
    
    md += `\n## 中网策略 (3档)\n\n`;
    md += `| 档位 | 买入价 | 股数 | 金额 | 卖出触发 | 单笔利润 |\n`;
    md += `|------|--------|------|------|----------|----------|\n`;
    
    document.querySelectorAll('#mediumGridTable tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        md += `| ${cells[0].textContent} | ${cells[1].textContent} | ${cells[2].textContent} | ${cells[3].textContent} | ${cells[4].textContent} | ${cells[7].textContent} |\n`;
    });
    
    md += `\n## 大网策略 (2档)\n\n`;
    md += `| 档位 | 买入价 | 股数 | 金额 | 卖出触发 | 单笔利润 |\n`;
    md += `|------|--------|------|------|----------|----------|\n`;
    
    document.querySelectorAll('#largeGridTable tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        md += `| ${cells[0].textContent} | ${cells[1].textContent} | ${cells[2].textContent} | ${cells[3].textContent} | ${cells[4].textContent} | ${cells[7].textContent} |\n`;
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
    
    // 下载
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${symbol}_grid_plan.md`;
    link.click();
}
