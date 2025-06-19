import './fearGreedGuage.css';
import '../recommendations/index.css';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    DoughnutController
} from "chart.js";
import {Doughnut} from 'react-chartjs-2';

import generalOpx from '../../functions/generalFunctions';

export default class FearGreedGuage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            plotData: [],
            loading: true
        },
        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        this.setFearGreedGuageState();
    }

    componentDidUpdate() {
        if(this.state.loading || this.state.plotData === undefined || this.state.plotData === null
            || this.state.plotData.length === 0) {this.setFearGreedGuageState();}
    }

    setFearGreedGuageState = async () => {
        this.setState(
            {
                plotData: this.props.plotData,
                loading: false
            }
        );
    }

    render() {
        ChartJS.register(
            CategoryScale,
            Title,
            Tooltip,
            Legend,
            ArcElement,
            DoughnutController
        );

        const data = {
            labels: ["score", "Gray Area"],
            datasets: [{
                lable: ``,
                data: this.state.loading ? null : this.state.plotData,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;

                    if(!chartArea) {
                        return ["rgba(46, 204, 113, 1)", "#9E9E9E"]
                    }
                    const gradientSegment = ctx.createLinearGradient(0, 0, chartArea.width, 0);

                    gradientSegment.addColorStop(0, '#df5344');
                    gradientSegment.addColorStop(0.5, '#f6be76');
                    gradientSegment.addColorStop(1, '#2ecc71');
                    return [gradientSegment, "#9E9E9E"]
                },
                borderWidth: 0,
                borderColor: 'rgb(0, 0, 0)', 
                cutout: "90%",
                circumference: 180,
                rotation: 270,
            }]
        }

        const that = this;
        const gaugeChartText = {
            id: 'gaugeChartText', 
            afterDatasetsDraw(chart, args, pluginOptions) {
                const {ctx, data, chartArea: {top, bottom, left, right, width, height}, scales: {r}} = chart;

                ctx.save();
                try {
                    const xCoor = chart.getDatasetMeta(0).data[0].x;
                    const yCoor = chart.getDatasetMeta(0).data[0].y;
                    const score = data.datasets[0].data[0];
                    const secondaryScore = data.datasets[0].data[1];
                    
                    //ctx.fillRect(xCoor, yCoor, 400, 5);
                    ctx.font = "10px sans-serif";
                    ctx.fillStyle = "#9E9E9E";
                    ctx.textBaseLine = "top";
                    ctx.textAlign = 'left';
                    ctx.fillText("0", left + 1, yCoor + 10);

                    ctx.textAlign = 'right';
                    ctx.fillText("100", right + 3, yCoor + 10);

                    ctx.font = "35px sans-serif";
                    ctx.fillStyle = "#FAFAFA";
                    ctx.textAlign = 'center';
                    ctx.fillText(`${Math.round(score)}`, xCoor, yCoor - 12.5);

                    ctx.font = "12px sans-serif";
                    ctx.fillStyle = "#9E9E9E";
                    ctx.textAlign = 'center';
                    ctx.textBaseLine = "bottom";
                    ctx.fillText(`Fear & Greed`, xCoor, yCoor + 10);
                } catch(error) {}
            }
        }

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1.5,
            animation: {
                duration: 0
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            layout: {
                padding: {
                    top: 0,
                    right: 4,
                    bottom: 10
                }
            },
            hover: {
                mode: null
            }
        }

        return(
            <div
                    style={this.state.loading || this.state.plotData === undefined || this.state.plotData === null
                            || this.state.plotData.length === 0 ?
                        {
                            "display": "flex", "alignItems": "center", "justifyContent": "center",
                            "width": "100%", "minWidth": "100%", "maxWidth": "100%", "height": "100%", "minHeight": "100%", "maxHeight": "100%"
                        } :
                        {
                            "display": "flex",
                            "width": "calc(100% - 20px)", "minWidth": "calc(100% - 20px)", "maxWidth": "calc(100% - 20px)", "height": "calc(100% - 20px)", "minHeight": "calc(100% - 20px)", "maxHeight": "calc(100% - 20px)"
                        }
                    }
                >
                {this.state.loading || this.state.plotData === undefined || this.state.plotData === null
                    || this.state.plotData.length === 0 ?
                    <div className="recommendation-GraphPieContainer">
                        <div className="finulab-chartLoading">
                            <div className="finulab-chartLoadingSpinner"/>
                            <img src="/assets/Finulab_Icon.png" alt="" className="finulab-chartLoadingImg" />
                        </div>
                    </div> : 
                    <Doughnut data={data} options={options} plugins={[gaugeChartText]}/>
                }
            </div>
        )
    }
}