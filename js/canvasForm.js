
window.onload = () => {
  const canvas = document.getElementById('canvas')
  canvas.width = 800
  canvas.height = 500

  const trWidth = 140
  const trHeight = 40

  const context = canvas.getContext('2d')
  const dataList = getDataList()

  canvas.onclick = function (e) {
    // console.log(e);
    const { x, y } = e
    const point = windowToCanvasPosition(x, y)
    const r = Math.floor(point.y / trHeight)
    const l = Math.floor(point.x / trWidth)
    console.log(r,l);
    render(context, {r,l})
  }

  function render(ctx, selectTbPosition) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#ccc'
    dataList.forEach((row, index) => {
      row.forEach((col, i) => {
        const x = i * trWidth
        const y = index * trHeight
        console.log('i>>>', i, x, y);
  
        // 绘制表格
        makeTable(ctx, x, y, trWidth, trHeight, selectTbPosition)
        // 绘制文字
        makeText(ctx, x+10, y + trHeight/2 + 6, col)
      })
    })
   
    ctx.stroke()
    ctx.restore()
  }

  function makeTable(ctx, x, y, width, height, selectTbPosition) {
    const { r, l } = selectTbPosition
    ctx.moveTo(x,y)
    ctx.rect(x,y,width,height)
  }
  function makeText(ctx, x, y, text) {
    ctx.font = '18px serif'
    ctx.fillText(text, x, y)
  }
  function windowToCanvasPosition(x = 0,y = 0) {
    const { left, top } = canvas.getClientRects()[0]
    return {
      x: x - left,
      y: y - top
    }
  }

}

function getDataList() {
  return [
    ['工作内容','优先级','类别','预计用时','任务截止时间','状态'],
    ['工作内容','content2','content3','content4','content5','content6'],
    ['content1','content2','content3','content4','content5','content6'],
    ['content1','content2','content3','content4','content5','content6'],
    ['content1','content2','content3','content4','content5','content6'],
  ]
}