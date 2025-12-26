

import React, { useState } from "react";

// ▼ データやサブコンポーネントはそのまま使います（チャートデータをもっと長く詳細に増量）
const chartData = [
  { time: "09:00", value: 81200 },
  { time: "09:30", value: 81800 },
  { time: "10:00", value: 82000 },
  { time: "10:30", value: 83000 },
  { time: "11:00", value: 85500 },
  { time: "11:30", value: 85000 },
  { time: "12:00", value: 83500 },
  { time: "12:30", value: 84000 },
  { time: "13:00", value: 82000 },
  { time: "13:30", value: 82500 },
  { time: "14:00", value: 82900 },
  { time: "14:30", value: 84800 },
  { time: "15:00", value: 86000 },
  { time: "15:30", value: 86700 },
  { time: "16:00", value: 87638 },
  { time: "16:30", value: 87200 },
  { time: "17:00", value: 87900 },
  { time: "17:30", value: 88300 },
  { time: "18:00", value: 89000 },
  { time: "18:30", value: 89250 },
  { time: "19:00", value: 89100 },
  { time: "19:30", value: 89500 },
  { time: "20:00", value: 90000 }
];

// チャート上にカーソルを合わせたときに詳細数値を表示するコンポーネント
function LineChart({ data, onHover }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const width = 720;
  const height = 220;
  const padding = 18;

  const pointsArr = data.map((d, i) => {
    const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
    const y =
      height -
      padding -
      ((d.value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
    return { x, y };
  });

  const points = pointsArr.map(({ x, y }) => `${x},${y}`);

  // X軸ラベル用
  const xLabels = data
    .filter((_, i) =>
      // 0, 4, 8, ... 4刻みで表示＋最後
      i % 4 === 0 || i === data.length - 1
    )
    .map((d, i) => ({
      time: d.time,
      x: padding + ((width - 2 * padding) * chartData.indexOf(d)) / (chartData.length - 1),
    }));

  // Y軸ラベル用（min, max, mid値）
  const yLabels = [
    { value: maxValue, y: padding + 8 },
    { value: Math.round((maxValue + minValue) / 2), y: height / 2 + 6 },
    { value: minValue, y: height - padding }
  ];

  // マウス座標から最も近い点のインデックスを取得
  function getHoverIndexFromX(clientX, svgRect) {
    const localX = clientX - svgRect.left;
    // [padding, width-padding]に収まるよう制限
    const boundedX = Math.max(padding, Math.min(localX, width - padding));
    // 比率からインデックスを計算
    const ratio = (boundedX - padding) / (width - 2 * padding);
    let hoverIdx = Math.round(ratio * (data.length - 1));
    hoverIdx = Math.max(0, Math.min(data.length - 1, hoverIdx));
    return hoverIdx;
  }

  // マウスイベントハンドラ
  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const index = getHoverIndexFromX(e.clientX, svgRect);
    setHoverIndex(index);
    setHoverPos({
      x: pointsArr[index].x,
      y: pointsArr[index].y,
    });
    // 追加: 親に詳細を伝える
    if (onHover) {
      onHover({
        index,
        value: data[index].value,
        time: data[index].time
      });
    }
  };
  const handleMouseLeave = () => {
    setHoverIndex(null);
    setHoverPos(null);
    // 追加: 親にhover解除を伝える
    if (onHover) {
      onHover(null);
    }
  };

  // Y軸ラベルのX座標を調整。0だとpaddingぎりぎり、paddingの6～10px左程度でよい
  const yLabelX = padding - 8;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
      }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ background: "transparent", overflow: "visible", display: "block" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-testid="chart-svg"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffae34" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1d1408" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* X, Y軸 */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#444" strokeWidth="1.2" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#444" strokeWidth="1.2" />

        {/* グリッド線（横） */}
        {yLabels.map((label, idx) => (
          <line
            key={idx}
            x1={padding}
            y1={label.y}
            x2={width - padding}
            y2={label.y}
            stroke="#333"
            strokeDasharray="3,4"
            strokeWidth="0.7"
          />
        ))}

        {/* グリッド線（縦、xLabels上だけ） */}
        {xLabels.map((label, idx) => (
          <line
            key={label.time}
            x1={label.x}
            y1={padding}
            x2={label.x}
            y2={height - padding}
            stroke="#333"
            strokeDasharray="3,4"
            strokeWidth="0.7"
          />
        ))}
        {/* チャートエリア（塗り部分） */}
        <polygon
          points={[
            `${padding},${height - padding}`,
            points.join(" "),
            `${width - padding},${height - padding}`
          ].join(" ")}
          fill="url(#chartGradient)"
          opacity="0.8"
        />
        {/* 折れ線 */}
        <polyline
          fill="none"
          stroke="#ffae34"
          strokeWidth="3"
          points={points.join(" ")}
        />
        {/* ドット/詳細点 */}
        {data.map((d, i) => {
          const { x, y } = pointsArr[i];
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3.7}
              fill="#ffae34"
              stroke="#fff"
              strokeWidth="1"
              opacity="0.95"
            />
          );
        })}
        {/* ハイライトカーソル・ライン */}
        {hoverIndex !== null && (
          <>
            {/* 縦ライン */}
            <line
              x1={pointsArr[hoverIndex].x}
              y1={padding}
              x2={pointsArr[hoverIndex].x}
              y2={height - padding}
              stroke="#ffae34"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.65"
              style={{ pointerEvents: "none" }}
            />
            {/* ハイライト円 */}
            <circle
              cx={pointsArr[hoverIndex].x}
              cy={pointsArr[hoverIndex].y}
              r={8}
              fill="#fff"
              opacity={0.13}
              style={{ pointerEvents: "none" }}
            />
            <circle
              cx={pointsArr[hoverIndex].x}
              cy={pointsArr[hoverIndex].y}
              r={5.2}
              fill="#ffae34"
              stroke="#fff"
              strokeWidth="2"
              style={{ pointerEvents: "none" }}
            />
          </>
        )}
        {/* Y軸ラベル */}
        {yLabels.map((label, idx) => (
          <text
            key={idx}
            x={yLabelX}
            y={label.y + 3}
            fill="#b0b3b8"
            fontSize="14"
            style={{ userSelect: "none" }}
            textAnchor="end"
          >
            ${label.value.toLocaleString()}
          </text>
        ))}
        {/* X軸ラベル */}
        {xLabels.map((label, idx) => (
          <text
            key={label.time}
            x={label.x}
            y={height - padding + 23}
            textAnchor="middle"
            fill="#b0b3b8"
            fontSize="14"
            style={{ userSelect: "none" }}
          >
            {label.time}
          </text>
        ))}
      </svg>
      {/* Tooltip（カーソル時の詳細数値は消去） */}
      {/* （何も表示しない） */}
    </div>
  );
}

// 架空ノンバンク債券（インドネシア）のリスト
const bonds = [
  {
    symbol: "IDNB-INS01",
    name: "インドネシアConsumerCredit#1",
    icon: "🏦"
  },
  {
    symbol: "IDNB-SME02",
    name: "インドネシアSMEローン#2",
    icon: "💼"
  },
  {
    symbol: "IDNB-MF03",
    name: "インドネシアMicrofinance#3",
    icon: "🌱"
  }
];

// 汎用選択コンポーネント（債券用）
function BondSelect({ value, onChange, bondsList }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: "#2c2d2e",
        color: "#fff",
        border: "1px solid #444",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "1em",
        width: "100%",
        marginBottom: "10px",
        cursor: "pointer"
      }}
    >
      {bondsList.map(b => (
        <option key={b.symbol} value={b.symbol}>
          {b.icon} {b.name}
        </option>
      ))}
    </select>
  );
}

// ▼ ここからメインのAppコンポーネントを編集
function App() {
  const [bondType, setBondType] = useState(bonds[0].symbol); // 売り・買い共通で選択
  const [faceValue, setFaceValue] = useState(""); // 額面金額
  const [hoveredChart, setHoveredChart] = useState(null);

  // ページ/タブ選択状態
  const [activeTab, setActiveTab] = useState("dashboard");

  const currentPrice = 87638.35;
  const priceDiff = 593.91;

  // 価格・時刻表示用
  const displayPrice = hoveredChart?.value ?? currentPrice;
  const displayTime = hoveredChart?.time;

  // 価格差・パーセンテージの計算
  const baseIndex = chartData.findIndex((c) => c.value === displayPrice);
  let prevIndex = baseIndex > 0 ? baseIndex - 1 : 0;
  let prevValue = chartData[prevIndex]?.value ?? displayPrice;
  let diff = displayPrice - prevValue;
  let diffPercent = prevValue !== 0 ? ((diff / prevValue) * 100) : 0;

  // カーソルなければデフォルト値
  let priceLabelColor;
  if (diff > 0) priceLabelColor = "#4caf50";
  else if (diff < 0) priceLabelColor = "#ff4d4f";
  else priceLabelColor = "#b0b3b8";

  // 疑似的な画面切替（activeTabで内容切替、ここでは1画面固定ダミー。）
  function handleTab(tab) {
    setActiveTab(tab);
    // 必要なら画面遷移ロジックを追加
  }

  // ナビアイテムリスト
  const navItems = [
    { label: "ダッシュボード", key: "dashboard" },
    { label: "取引", key: "trade" },
    { label: "プール", key: "pool" }
  ];

  // 金額制限：0超のみ
  function handleFaceValue(e) {
    const v = e.target.value;
    // 小数点許可、マイナス不可
    if (/^\d*\.?\d*$/.test(v)) {
      setFaceValue(v);
    }
  }

  // 選択中の債券情報（nameなど取得用）
  const selectedBond = bonds.find(b => b.symbol === bondType);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#18191a",
        color: "#fff",
        fontFamily: "Segoe UI, Arial, sans-serif",
        overflow: "auto",
        zIndex: 0,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 30px",
          background: "#242526",
          borderBottom: "1px solid #3a3b3c",
          width: "100vw",
          position: "sticky",
          top: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#ffae34" }}>RWA Platform</div>
        <nav style={{ display: "flex", gap: "20px", fontSize: "0.9rem" }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleTab(item.key)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: activeTab === item.key ? "#ffd98a" : "#b0b3b8",
                fontWeight: activeTab === item.key ? "bold" : "normal",
                fontSize: "inherit",
                padding: 0,
                outline: "none",
                borderBottom: activeTab === item.key ? "2px solid #ffae34" : "2px solid transparent",
                transition: "color 0.13s, border-bottom 0.13s"
              }}
              tabIndex={0}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={{
        width: "100vw",
        height: "calc(100vh - 62px)",
        boxSizing: "border-box",
        margin: 0,
        padding: "0 40px",
        display: "flex",
        gap: "40px",
        flexWrap: "wrap",
        alignItems: "stretch",
        justifyContent: "center",
      }}>
        {/* 左側：チャートと情報 */}
        <div style={{ flex: "2", minWidth: "350px", minHeight: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ margin: 0, fontSize: "2.5rem" }}>
              ${displayPrice.toLocaleString()}
              {
                displayTime &&
                <span style={{ fontSize: "1.1rem", color: "#b0b3b8", marginLeft: "13px" }}>{displayTime}</span>
              }
            </h1>
            <span style={{ color: priceLabelColor, fontSize: "1.1rem" }}>
              {diff > 0 && "+"}
              {diff.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              {" "}
              ({diffPercent > 0 ? "+" : ""}{diffPercent.toFixed(2)}%)
            </span>
          </div>

          {/* 定義したLineChartを表示 */}
          <div style={{ flex: "none", height: "300px", marginBottom: "40px", minWidth: 0 }}>
             <LineChart data={chartData} onHover={setHoveredChart} />
          </div>

          {/* 統計データの表示 */}
          <div style={{ borderTop: "1px solid #3a3b3c", paddingTop: "20px" }}>
            <h4 style={{ color: "#b0b3b8", fontSize: "1rem", marginBottom: "10px" }}>価格チャート（X: 時間, Y: 価格 詳細）</h4>
            <div style={{
              flex: "none",
              height: "320px",
              background: "#202123",
              borderRadius: "8px",
              padding: "16px",
              minWidth: 0,
              overflowX: "auto"
            }}>
              {/* より詳細なSVGチャート例（同じデータを使い見やすく） */}
              <svg width={900} height={260} viewBox={`0 0 900 260`}>
                {/* X, Y 軸 */}
                <line x1="54" y1="26" x2="54" y2="220" stroke="#888" strokeWidth="1.2"/>
                <line x1="54" y1="220" x2="880" y2="220" stroke="#888" strokeWidth="1.2"/>
                {/* 横グリッド */}
                {[0, 1, 2, 3, 4].map(i => {
                  const y = 46 + i * 40;
                  return (
                    <line key={i} x1="54" y1={y} x2="880" y2={y} stroke="#222" strokeDasharray="7 5" strokeWidth="1"/>
                  );
                })}
                {/* 縦グリッド（4本 + 最後） */}
                {[0, 6, 12, 18, chartData.length - 1].map(idx => {
                  const x = 54 + ((880 - 54) * idx) / (chartData.length - 1);
                  return (
                    <line key={idx} y1="26" y2="220" x1={x} x2={x} stroke="#222" strokeDasharray="5 5" strokeWidth="1"/>
                  );
                })}
                {/* 折れ線チャート */}
                <polyline
                  fill="none"
                  stroke="#ffae34"
                  strokeWidth="3"
                  points={
                    chartData
                      .map((d, i) => {
                        const x = 54 + ((880 - 54) * i) / (chartData.length - 1);
                        // Y座標スケーリング
                        const vMax = Math.max(...chartData.map(pt => pt.value));
                        const vMin = Math.min(...chartData.map(pt => pt.value));
                        const y = 220 - ((d.value - vMin) / (vMax - vMin)) * (220 - 26);
                        return `${x},${y}`;
                      })
                      .join(" ")
                  }
                />
                {/* ● 各点 */}
                {chartData.map((d, i) => {
                  const x = 54 + ((880 - 54) * i) / (chartData.length - 1);
                  const vMax = Math.max(...chartData.map(pt => pt.value));
                  const vMin = Math.min(...chartData.map(pt => pt.value));
                  const y = 220 - ((d.value - vMin) / (vMax - vMin)) * (220 - 26);
                  return (
                    <circle
                      key={d.time}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#ffae34"
                      stroke="#fff"
                      strokeWidth="1"
                      opacity="0.97"
                    />
                  );
                })}
                {/* Y軸ラベル（min, mid, max） */}
                {(() => {
                  const vMax = Math.max(...chartData.map(d => d.value));
                  const vMin = Math.min(...chartData.map(d => d.value));
                  const step = (vMax - vMin) / 4;
                  // デフォルトの x="6" だと左寄りすぎる。10～15pxほど右へ（例: x="18"）
                  return [vMax, vMax - step, vMin + step, vMin].map((val, i) => (
                    <text
                      key={i}
                      x="18"
                      y={46 + i * 40 + 7}
                      fill="#b0b3b8"
                      fontSize="14"
                      style={{userSelect: "none"}}
                      textAnchor="end"
                    >
                      ${Math.round(val).toLocaleString()}
                    </text>
                  ));
                })()}
                {/* X軸ラベル */}
                {chartData
                  .filter((_, i) =>
                    i % 6 === 0 || i === chartData.length - 1
                  )
                  .map((d, iFiltered) => {
                    const i = chartData.indexOf(d);
                    const x = 54 + ((880 - 54) * i) / (chartData.length - 1);
                    return (
                      <text
                        key={d.time}
                        x={x}
                        y={240}
                        fill="#b0b3b8"
                        fontSize="15"
                        textAnchor="middle"
                        style={{ userSelect: "none" }}
                      >
                        {d.time}
                      </text>
                    );
                  })}
              </svg>
            </div>
          </div>
        </div>

        {/* 右側：架空ノンバンク債権の購入パネル */}
        <div style={{
          flex: "1",
          minWidth: "350px",
          maxWidth: "450px",
          background: "#242526",
          padding: "40px 32px",
          borderRadius: "16px",
          border: "1px solid #3a3b3c",
          height: "fit-content",
          alignSelf: "center",
          boxShadow: "0 4px 48px #0e0e0e77",
          margin: "auto 0",
        }}>
          <h3 style={{ marginTop: 0, fontSize: "1.3rem" }}>債権購入</h3>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#b0b3b8", marginBottom: "5px", fontSize: "0.95rem" }}>債権種別</label>
            <BondSelect value={bondType} onChange={setBondType} bondsList={bonds} />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label style={{ display: "block", color: "#b0b3b8", marginBottom: "5px", fontSize: "0.95rem" }}>購入額面金額</label>
            <input
              type="number"
              min="0"
              pattern="^\d*\.?\d*$"
              placeholder="金額を入力（例: 1000000）"
              value={faceValue}
              onChange={handleFaceValue}
              style={{
                width: "100%",
                background: "#18191a",
                border: "none",
                color: "white",
                padding: "14px",
                borderRadius: "8px",
                fontSize: "1.2rem",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            style={{
              width: "100%",
              padding: "18px",
              background: "linear-gradient(92deg, #ffae34, #ffd38a 110%)",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.11rem",
              fontWeight: "bold",
              cursor: faceValue && parseFloat(faceValue) > 0 ? "pointer" : "not-allowed",
              color: "#000",
              marginTop: "16px",
              boxShadow: "0 2px 12px #ffae3440",
              transition: "background 0.18s, transform 0.15s",
              opacity: faceValue && parseFloat(faceValue) > 0 ? 1 : 0.6
            }}
            disabled={!faceValue || parseFloat(faceValue) <= 0}
            onClick={() => {
              if (faceValue && parseFloat(faceValue) > 0) {
                alert(`「${selectedBond?.name}」を額面金額 ${Number(faceValue).toLocaleString()}円で購入リクエストしました。`);
                setFaceValue("");
              }
            }}
          >
            購入する
          </button>

        </div>
      </main>
    </div>
  );
}

export default App;