window.onload = function() {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const canvasWidth = 375;
  const devicePixelRatio = window.devicePixelRatio || 1;

  canvas.width = canvasWidth * devicePixelRatio
  canvas.height = canvasWidth * devicePixelRatio
  const { width, height } = canvas

  let isMouseDown = false;
  let lastPosition = {
    x: 0,
    y: 0,
  }
  let lastTime = 0
  let lastWidth = -1
  const BASE_LINE_WIDTH = 20

  function renderGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'red';

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height)

    ctx.beginPath();
    ctx.moveTo(3, 3);
    ctx.lineTo(3, height - 3);
    ctx.lineTo(width - 3, height - 3);
    ctx.lineTo(width - 3, 3);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(3, 3);
    ctx.lineTo(width - 3, height - 3);
    ctx.moveTo(width - 3,3);
    ctx.lineTo(3, height - 3);
    ctx.moveTo(width / 2, 3);
    ctx.lineTo(width/2, height);
    ctx.moveTo(3, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }

  canvas.addEventListener('mousedown', mouseDownFn)
  canvas.addEventListener('touchstart', mouseDownFn)
  function  mouseDownFn(el) {
    el.stopPropagation();
    el.preventDefault();
    isMouseDown = true;
    const clientX = el.clientX ?? el.touches[0].clientX
    const clientY = el.clientY ?? el.touches[0].clientY
    const { x, y } = positionWindowToCanvas(clientX, clientY);
    lastPosition = {
      x,
      y,
    }
    lastTime = new Date().getTime()
    lastV = 0
  }

  document.addEventListener('mousemove', mouseMoveFn)
  document.addEventListener('touchmove', mouseMoveFn)
  function mouseMoveFn(el) {
    el.stopPropagation();
    el.preventDefault();
    if (!isMouseDown) {
      return
    }
    const clientX = el.clientX ?? el.touches[0].clientX;
    const clientY = el.clientY ?? el.touches[0].clientY;
    const { x, y } = positionWindowToCanvas(clientX, clientY);
    const t = new Date().getTime();
    const s = Math.sqrt((x - lastPosition.x)*(x - lastPosition.x) + (y - lastPosition.y)* (y - lastPosition.y));
    const w = calcLineWidth(t - lastTime, s);
    render(context, x, y, w);
    lastPosition = {
      x,
      y,
    }
    lastTime = t;
    lastWidth = w;
  }

  document.addEventListener('mouseup', mouseUpFn);
  document.addEventListener('touchend', mouseUpFn);
  function mouseUpFn(el) {
    isMouseDown = false
  }

  function positionWindowToCanvas(x, y) {
    const { left, top }  = canvas.getBoundingClientRect();
    return { x: (x-left)* devicePixelRatio, y: (y-top)* devicePixelRatio };
  }
  function calcLineWidth(t, s) {
    let v = s/t;
    let w = BASE_LINE_WIDTH - (v-0.1)/(10-0.1)*(BASE_LINE_WIDTH-1);
    if (v < 0.1) {
      w = BASE_LINE_WIDTH;
    } else if (v >= 10) {
      w = 4;
    }
    if (lastWidth !== -1) {
      w = w*1/3 + lastWidth*2/3;
    }
    return w;
  }

  function render(ctx, x, y, w) {
    ctx.beginPath();
    ctx.lineWidth = w;
    ctx.strokeStyle = '#000';
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // preventVague(context);
    ctx.stroke();
    ctx.closePath();
  }

  // 下载图片
  const downloadBtn = document.getElementById('download');
  downloadBtn.addEventListener('click', () => {
    const canvas2 = document.createElement('canvas')
    canvas2.width = canvas.width/devicePixelRatio
    canvas2.height = canvas.height/devicePixelRatio
    const ctx2 = canvas2.getContext('2d')
    ctx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas2.width, canvas2.height)
    const newImg = document.createElement('img')
    const url = canvas2.toDataURL()
    newImg.src = url
    newImg.onload = () => {
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', '图片');
      a.click();
    }
  });
  
  renderGrid(context);
}