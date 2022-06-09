const fs = require('fs');
const ChartJS = require('chart.js');
const { createCanvas } = require('canvas')
export class Chart{
    static initiate(){
        var backgroundColor = 'white';
        ChartJS.register({
            beforeDraw: function(chart:any, argsL:any, options:any) {
                var ctx = chart.chart.ctx;
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, chart.chart.width, chart.chart.height);
            }
        });
    }
    static generateEquityChart(data:Array<number>,labels:Array<string>,result:string){
        let meanData:Array<number> = [];
        let lastVal:number = data[data.length-1];
        let increment:number = lastVal/data.length;
        let currentVal:number = 0;
        for(let i of data){
            meanData.push(currentVal);
            currentVal+=increment;
        }
        const plugin = {
            id: 'custom_canvas_background_color',
            beforeDraw: (chart:any) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = '#363636';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
        };
        let canvas = createCanvas(1200, 600);
        let ctx = canvas.getContext('2d');
        let myChart = new ChartJS(ctx,{
            type: 'line',
            data: { 
                labels: labels, 
                    datasets: [{ 
                            label: 'Profit %', 
                            data: data ,
                            backgroundColor: '#363636',
                            borderColor: '#14d0ff',
                            pointBackgroundColor: 'black',
                            color:"white"
                        },
                        { 
                            label: 'Mean %', 
                            data: meanData ,
                            backgroundColor: '#363636',
                            borderColor: 'grey',
                            //pointBackgroundColor: 'black',
                            color:"white"
                        }
                    ]
            },
            plugins: [plugin],
            options: {
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'white'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Moontrade Profit Chart',
                        color: "white",
                        font: {
                            size: 18,
                        }
                    },
                    subtitle: {
                        display: true,
                        text: result,
                        color: "white",
                        font: {
                            size: 15,
                        }
                    }
                    
                },
                scales: {
                    x: {
                        ticks: {
                        color: 'white',
                        },
                        grid: {
                            color:"grey"
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white',
                        },
                        grid: {
                            color:"grey"
                        }
                    }
                }
            }
        });
        const buffer = canvas.toBuffer('image/png')
        fs.writeFileSync('./backtest/result/profit-chart.png', buffer) 
    }
}