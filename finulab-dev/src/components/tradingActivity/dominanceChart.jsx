import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Title,
    Legend,
    BarElement,
    Tooltip,
    LogarithmicScale
} from "chart.js";
import {Bar} from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { PrecisionManufacturing } from '@mui/icons-material';

import generalOpx from '../../functions/generalFunctions';

export default class DominanceChart extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            chart: null,
            loading: true,

            totalMarketCap: 0,

            plotLabels: [],
            plotDominanceData: [],
            plotMarketCapSupport: []
        };
        this.tooltipRef = React.createRef();
    }

    componentDidMount() {
        this.setPlotDominanceDataState();
    }

    componentDidUpdate() {
        if(this.state.loading ||
            this.state.plotDominanceData.reduce((a, b) => a + b, 0) === 0
        ) {this.setPlotDominanceDataState();}
    }

    componentWillUnmount() {
        if(this.tooltipRef.current) {
            this.tooltipRef.current.remove();
            this.tooltipRef.current = null;
        }
    }

    setPlotDominanceDataState = async () => {
        this.setState(
            {
                loading: false,

                totalMarketCap: this.props.totalMarketCap,

                plotLabels: this.props.plotLabels,
                plotDominanceData: this.props.plotDominanceData,
                plotMarketCapSupport: this.props.plotMarketCapSupport
            }
        );
    }

    divideSupport = (num, den) => {
        try {
            const rslt = num / den;
            return rslt;
        } catch(err) {return 0}
    }

    externalTooltipHandler = (context) => {
        const { chart, tooltip } = context;
    
        // Get or create the tooltip element
        let tooltipEl = this.tooltipRef.current;
        if(!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.style.background = '#000000';
            tooltipEl.style.border = 'solid 1px #424242';
            tooltipEl.style.color = 'white';
            tooltipEl.style.borderRadius = '3px';
            tooltipEl.style.padding = '5px 10px';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.zIndex = '1000';
            tooltipEl.style.fontSize = '12px';
            document.body.appendChild(tooltipEl);
            this.tooltipRef.current = tooltipEl;
        }
    
        // Hide if no tooltip data
        if(tooltip.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
        }

        let targetLeftAdjusterSupport = 0;
        // Generate HTML content based on category
        if(tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map((b) => b.lines);
            const dataIndex = tooltip.dataPoints[0].dataIndex;
            targetLeftAdjusterSupport = dataIndex;
            const buysData = this.state.plotDominanceData[dataIndex];
            const sellsData = 100 - buysData;
            const marketCap = this.state.plotMarketCapSupport[dataIndex];

            let innerHtml = '<div>';
  
            // Add title
            titleLines.forEach((title) => {
                innerHtml += `<div style="font-weight: bold; margin-bottom: 5px;">${title}</div>`;
            });
  
            innerHtml += `
            <div style="display: flex; flex-direction: column; width: 150px; min-width: 150px; max-width: 150px; height:43px; min-height:43px; max-height:43px;">
                <div style="display: flex; align-items: center; width: 100%; min-width: 100%; max-width: 100%;">
                    <span style="color: ${this.props.type === "MC" || this.props.type === "VOL" ? `#2E6DE0;` : marketCap >= 0 ? `var(--primary-green-09);` : `var(--primary-red-09);`}">${buysData === 0 ? 0 : generalOpx.formatFigures.format(buysData)}% of ${this.props.type === "GL" ? `Market's Change` : `Market`}</span>
                </div>
                <div style="display:flex; align-items:center; margin-top:5px; width:150px; min-width:150px; max-width:150px;">
                    ${buysData === 0 ?
                        `<div style="background-color:#9E9E9E; border-radius:3px; height:3px; min-height:3px; max-height:3px; width:150px; min-width:150px; max-width:150px;"></div>` : ``
                    }
                    ${sellsData === 0 ?
                        `<div style="background-color: ${this.props.type === "MC" || this.props.type === "VOL" ? `#2E6DE0;` : marketCap >= 0 ? `var(--primary-green-09);` : `var(--primary-red-09);`} border-radius:3px; height:3px; min-height:3px; max-height:3px; width:150px; min-width:150px; max-width:150px;"></div>` : ``
                    }
                    ${buysData > 0 && buysData < 5 ?
                        `<div style="background-color: ${this.props.type === "MC" || this.props.type === "VOL" ? `#2E6DE0;` : marketCap >= 0 ? `var(--primary-green-09);` : `var(--primary-red-09);`} border-radius:3px; height:3px; min-height:3px; max-height:3px; width:5px; min-width:5px; max-width:5px;"/>
                        <div style="margin-left: 10px; background-color: #9E9E9E; border-radius:3px; height:3px; min-height:3px; max-height:3px; width:140px; min-width:140px; max-width:140px;"/>
                        ` : ``
                    }
                    ${sellsData > 0 && sellsData < 5 ?
                        `<div style="background-color: ${this.props.type === "MC" || this.props.type === "VOL" ? `#2E6DE0;` : marketCap >= 0 ? `var(--primary-green-09);` : `var(--primary-red-09);`} border-radius:3px; height:3px; min-height:3px; max-height:3px; width:140px; min-width:140px; max-width:140px;"/>
                        <div style="margin-left: 145px; background-color: #9E9E9E; border-radius:3px; height:3px; min-height:3px; max-height:3px; width:5px; min-width:5px; max-width:5px;"/>
                        ` : ``
                    }
                    ${buysData > 5 && sellsData > 5 ?
                        `<div style="background-color: ${this.props.type === "MC" || this.props.type === "VOL" ? `#2E6DE0;` : marketCap >= 0 ? `var(--primary-green-09);` : `var(--primary-red-09);`} border-radius:3px; height:3px; min-height:3px; max-height:3px; width:${((buysData / 100) * 150) - 2.5}px; min-width:${((buysData / 100) * 150) - 2.5}px; max-width:${((buysData / 100) * 150) - 2.5}px;"/>` : ``
                    }
                    ${buysData > 5 && sellsData > 5 ?
                        `<div style="margin-left: ${((buysData / 100) * 150) + 5}px; background-color: #9E9E9E; border-radius:3px; height:3px; min-height:3px; max-height:3px; width:${((sellsData / 100) * 150) - 2.5}px; min-width:${((sellsData / 100) * 150) - 2.5}px; max-width:${((sellsData / 100) * 150) - 2.5}px;"/>` : ``
                    }
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 5px; width: 150px; min-width: 150px; max-width: 150px;">
                    <span style="color: #9E9E9E;">${marketCap >= 0 ? `${this.props.type === "VOL" ? `` : `$`}${generalOpx.formatLargeFigures(marketCap, 2)}` : `(${this.props.type === "VOL" ? `` : `$`}${generalOpx.formatLargeFigures(Math.abs(marketCap), 2)})`}</span>
                    <span style="margin-left: auto; color: #9E9E9E;">${this.state.totalMarketCap >= 0 ? `${this.props.type === "VOL" ? `` : `$`}${generalOpx.formatLargeFigures(this.state.totalMarketCap, 2)}` : `(${this.props.type === "VOL" ? `` : `$`}${generalOpx.formatLargeFigures(Math.abs(this.state.totalMarketCap), 2)})`}</span>
                </div>
            </div>`;
    
            innerHtml += '</div>';
            tooltipEl.innerHTML = innerHtml;
        }
    
        // Position the tooltip
        const position = chart.canvas.getBoundingClientRect();
        const targetLeftAdjuster = (targetLeftAdjusterSupport / (this.state.plotLabels.length - 1)) * 125;
        tooltipEl.style.opacity = '1';
        tooltipEl.style.left = `${position.left + window.pageXOffset + tooltip.caretX - 25 - targetLeftAdjuster}px`;
        tooltipEl.style.top = `${position.top + window.pageYOffset - 70}px`;
    };

    render() {
        ChartJS.register(
            CategoryScale,
            LinearScale,
            Title,
            Legend,
            BarElement,
            Tooltip,
            LogarithmicScale,
            annotationPlugin
        );

        const data = {
            labels: this.state.loading ? null : this.state.plotLabels,
            datasets: [
                {
                    lable: `a`,
                    data: this.state.loading ? null : this.state.plotDominanceData,
                    backgroundColor: this.state.loading ? null : 
                        this.props.type === "MC" || this.props.type === "VOL" ? 
                        Array(this.state.plotDominanceData.length).fill("#2F93C3") : 
                        this.state.plotMarketCapSupport.map(cap_supp => cap_supp >= 0 ? "#2ecc71" : "#df5344"),
                    hoverBackgroundColor: this.state.loading ? null : 
                        this.props.type === "MC" || this.props.type === "VOL" ? 
                        "#61a7e8" : 
                        this.state.plotMarketCapSupport.map(cap_supp => cap_supp >= 0 ? "#6bde9c" : "#e88176"),
                    borderWidth: 1,
                    borderRadius: 3,
                    barPercentage: 1.2,
                    categoryPercentage: 0.8
                }
            ]
        }

        const plugins = [ 
            {
                id: 'verticalLine',
                afterDraw: (chart, args, options) => {
                  if (chart.tooltip._active && chart.tooltip._active.length) {
                    const activePoint = chart.tooltip._active[0];
                    const { ctx } = chart;
                    const { x } = activePoint.element;
                    const { top, bottom } = chart.chartArea;
              
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, top - 12);
                    ctx.lineTo(x, bottom);
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = '#424242';
                    ctx.stroke();
                    ctx.restore();
                  }
                }
            }
        ];

        const options = {
            type: 'bar',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            annotations: {
                annotation: {
                    type: "line",
                    scaleID: "y",
                    borderWidth: 1,
                    borderDash: [8, 5],
                    borderColor: "#424242",
                    value: 0,
                    label: {
                        enabled: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false,
                    external: this.externalTooltipHandler,
                    mode: 'index',
                    intersect: false,
                    displayColors: true,
                    animation: {
                        duration: 0
                    },
                    titleColor: '#616161',
                    footerFont: 'normal',
                    footerColor: '#E0E0E0',
                }
            },
            hover: {
                mode: 'index',
                intersect: false,
                animation: {
                    duration: 0
                }
            },
            scales: {
                x: {
                    ticks: {
                        display: true,
                        minRotation: 0,
                        maxRotation: 0,
                        font: {
                            color: '#616161',
                            size: 10
                        }
                    },
                    grid: {
                        display: false,
                        borderColor: 'rgb(6 10 13)',
                        offset: false,
                    }
                },
                y: {
                    type: 'logarithmic',
                    ticks: {
                        display: false,
                        beginAtZero: true
                    },
                    grid: {
                        display: false,
                        borderColor: 'rgb(6 10 13)'
                    }
                }
            }
        }

        return(
            <div
                    style={{
                        "position": "relative",
                        "display": "flex",
                        "alignItems": "center", "justifyContent": "center",
                        "width": "100%", "minWidth": "100%", "maxWidth": "100%",
                        "height": "100%", "minHeight": "100%", "maxHeight": "100%"
                    }}
                >
                    {this.state.loading ? 
                        null : 
                        <>
                            <Bar data={data} options={options} plugins={plugins} redraw={false}/>
                            {this.state.plotDominanceData.reduce((a, b) => a + b, 0) === 0 ?
                                <div
                                        style={{
                                            "zIndex": "9",
                                            "position": "absolute",
                                            "top": "30px",
                                            "display": "flex",
                                            "flexDirection": "column",
                                            "alignItems": "center"
                                        }}
                                    >
                                    <PrecisionManufacturing 
                                        style={{
                                            "color": "var(--primary-bg-05)",
                                            "transform": "scale(2.5)"
                                        }}
                                    />
                                    <div
                                            style={{
                                                "marginTop": "20px",
                                                "fontWeight": "500",
                                                "fontSize": "1rem",
                                                "color": "var(--primary-bg-05)"
                                            }}
                                        >
                                        No Data for Last Year.
                                    </div>
                                </div> : null
                            }
                        </>
                    }
            </div>
        )
    }
}