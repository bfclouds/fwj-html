const REDUCE_YEAR = 'reduce_year'
const REDUCE_MONTH = 'reduce_month'
const ADD_YEAR = 'add_year'
const ADD_MONTH = 'add_month'

class AffiliateDate {
  constructor(selector, options, successCallBack) {
    this.dateEl = document.querySelector(selector)
    this.dateCalendarEl = null
    this.date = dayjs(options.currentYm)
    this.nowDate = dayjs()
    this.options = options
    this.dateRows = [[], [], [], [], [], []]
    this.currentSelectEl = null
    this.successCallBack = successCallBack

    const { minDate, maxDate } = options
    this.minDateDayjs = minDate ? dayjs(minDate) : null
    this.maxDateDayjs = maxDate ? dayjs(maxDate) : null

    this.render()
  }
  show() {
    this.dateEl.style.display = 'block'
  }
  close() {
    // this.dateEl.style.display = 'none'
  }
  renderDateTable() {
    const offsetDay = this.date.date(1).day() || 7
    const currentMonthDays = this.date.daysInMonth(); // 当月天数
    const lastMontDays = this.date.date(1).subtract(1, 'd').daysInMonth()
    let lastDayCount = 1
    const newDateYmStr = this.date.format('yyyy-mm')
    
    let trEls = []
    for (let r = 0; r < this.dateRows.length; r++) {
      this.dateRows[r].length = 0
      const row = this.dateRows[r]
      let trEl = document.createElement('tr')
      trEl.classList.add('date-table_row')
      for (let l = 0; l < 7; l++) {
        const theDay = r * 7 + l - offsetDay + 1;
        if (r === 0 && l < offsetDay) {
          // last month
          row[l] = {
            text: lastMontDays - offsetDay + l + 1,
            row: r,
            column: l,
            isSelect: false,
            el: null,
          };
        } else if (theDay > currentMonthDays) {
          // next month
          row[l] = {
            text: lastDayCount++,
            row: r,
            column: l,
            isSelect: false,
            el: null,
          };
        } else {
          // current month
          const dayYmdStr = `${newDateYmStr}-${theDay}`
          let available = false
          if ((!this.minDateDayjs || this.minDateDayjs.isBefore(dayYmdStr))
            && (!this.maxDateDayjs || this.maxDateDayjs.isAfter(dayYmdStr))) {
              available = true
          }
          row[l] = {
            text: theDay,
            row: r,
            column: l,
            ymd: dayYmdStr,
            isToday: this.nowDate.format('yyyy-mm-dd') === dayYmdStr,
            isSelect: this.currentSelectEl && this.currentSelectEl.ymd && this.currentSelectEl.ymd === `${newDateYmStr}-${theDay}`,
            el: null,
            available,
          };
        }
        const tdEl = document.createElement('td')
        row[l].el = tdEl
        tdEl.classList.add('date-table_col')

        if (row[l].isToday) {
          tdEl.classList.add('today')
        }
        if (row[l].isSelect) {
          tdEl.classList.add('active')
          this.currentSelectEl = row[l]
        }
        if (row[l].available) {
          tdEl.classList.add('available')
        } else {
          tdEl.classList.add('normal')
        }

        tdEl.innerHTML = `
          <div class="date-table-cell">
            <span class="date-table-cell_text">${row[l].text}</span>
          </div>
        `
        tdEl.onclick = () => {
          if (!row[l].available) {
            return
          }
          if (this.currentSelectEl && this.currentSelectEl.el) {
            this.currentSelectEl.el.classList.remove('active')
          }
          tdEl.classList.add('active')
          this.currentSelectEl = row[l]
        }
        
        trEl.appendChild(tdEl)
      }
      trEls.push(trEl)
    }
    const tbodyEl = this.dateCalendarEl.querySelector('tbody')
    const parentElement = tbodyEl.parentElement
    parentElement.removeChild(tbodyEl)
    const newTbodyEl = document.createElement('tbody')
    trEls.forEach(el => {
      newTbodyEl.appendChild(el)
    })
    parentElement.appendChild(newTbodyEl)
  }
  renderDateTitle() {
    const dateTitleEL = this.dateCalendarEl.querySelector('.date-title')
    dateTitleEL.innerText =`${this.date.format('yyyy-mm')}`
  }
  handleBtnEvent() {
    const cancelBtn = this.dateEl.querySelector('#cancel-btn')
    const okBtn = this.dateEl.querySelector('#ok-btn')
    cancelBtn.addEventListener('click', (e) => {
      e.stoppropagation && e.stoppropagation()
      this.close()
    })
    okBtn.addEventListener('click', (e) => {
      e.stoppropagation && e.stoppropagation()
      this.successCallBack(this.currentSelectEl && this.currentSelectEl.ymd)
    })
  }
  handleChangeYmEvent() {
    const ymChangeBtns = this.dateCalendarEl.querySelectorAll('.date-icon')
    const ymChange = (el) => {
      console.log(el);
      const target = el.target
      const { type } = target.dataset
      // const newDateStr = this.date.format('yyyy-mm-dd')
      let newDate = null
      if (type === REDUCE_YEAR) {
        // if (minDateDayjs && !minDateDayjs.isBefore(newDateStr, 'y')) {
        //   return
        // }
        newDate = this.date.subtract(1, 'y')
      } else if (type === REDUCE_MONTH) {
        // if (minDateDayjs && !minDateDayjs.isBefore(newDateStr, 'm')) {
        //   return
        // }
        newDate = this.date.subtract(1, 'm')
      } else if (type === ADD_YEAR) {
        // if (maxDateDayjs && !maxDateDayjs.isAfter(newDateStr, 'y')) {
        //   return
        // }
        newDate = this.date.subtract(-1, 'y')
      } else if (type === ADD_MONTH) {
        // if (maxDateDayjs && !maxDateDayjs.isAfter(newDateStr, 'm')) {
        //   return
        // }
        newDate = this.date.subtract(-1, 'm')
      }
      this.date = newDate
      setTimeout(() => {
        this.renderDateTable()
        this.renderDateTitle()
      })
    }
    for (let i = 0; i < ymChangeBtns.length; i++) {
      ymChangeBtns[i].addEventListener('click', (e) => {
        e.stopPropagation()
        ymChange(e)
      })
    }
  }
  render() {
    if (this.dateCalendarEl && this.dateEl) {
      this.dateEl.removeChild(this.dateCalendarEl)
    }
    const dateCalendarEl = document.createElement('div')
    dateCalendarEl.classList.add('date-calendar')
    dateCalendarEl.innerHTML = `
      <div class="date-calendar-header">
        <div class="left">
          <i class="date-icon icon_double_left_block" data-type="${REDUCE_YEAR}"></i>
          <i class="date-icon icon_left_block" data-type="${REDUCE_MONTH}"></i>
        </div>
          <span class="date-title"></span>
        <div class="right">
          <i class="date-icon icon_right_block" data-type="${ADD_MONTH}"></i>
          <i class="date-icon icon_double_right_block" data-type="${ADD_YEAR}"></i>
        </div>
      </div>
      <table class="date-table">
        <tbody>
          <tr class="">
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </tbody>
      </table>
      <div class="date-btn-wrapper">
        <button class="date-btn" id="cancel-btn">cancel</button>
        <button class="date-btn" id="ok-btn">ok</button>
      </div>
    `

    this.dateEl.appendChild(dateCalendarEl)
    this.dateCalendarEl = dateCalendarEl

    this.renderDateTable()
    this.renderDateTitle()
    this.handleChangeYmEvent()
    this.handleBtnEvent()
  }
}

function dayjs(dateVal = new Date()) {
  const dateValue = new Date(dateVal)
  const y = dateValue.getFullYear()
  const m = dateValue.getMonth()
  const d = dateValue.getDate()
  // function getYmd() {
  //   return {
  //     y: dateValue.getFullYear(),
  //     m: dateValue.getMonth(),
  //     d: dateValue.getDate()
  //   }
  // }

  return {
    format(rule) {
      const arr = rule.split('-') // other rule, reg
      const dateArr = [y+'', m+1+'', d+'']
      const res = arr.map((item, index) => {
        while(item.length > dateArr[index].length) {
          dateArr[index] = `0${dateArr[index]}`
        }
        return dateArr[index]
      })
      return res.join('-')
    },
    year(account) {
      if (account) {
        const newDate = new Date(dateValue)
        newDate.setFullYear(account)
        return dayjs(newDate)
      } else {
        return y
      }
    },
    month(account) {
      if (account) {
        const newDate = new Date(dateValue)
        newDate.setMonth(account - 1)
        return dayjs(newDate)
      } else {
        return m
      }
    },
    date(account) {
      if (account) {
        const newDate = new Date(dateValue)
        newDate.setDate(account)
        return dayjs(newDate)
      } else {
        return d
      }
    },
    day(dVal = 1) {
      return new Date(`${y}-${m+1}-${dVal}`).getDay()
    },
    subtract(num, type) {
      const newDate = new Date(dateValue)
      if (type === 'd') {
        newDate.setDate(d-num)
      } else if (type === 'm') {
        newDate.setMonth(m-num)
      } else if (type === 'y') {
        newDate.setFullYear(y-num)
      } else {
        console.warn("subtract error")
        return
      }
      return dayjs(newDate)
    },
    daysInMonth() {
      const newDate = new Date(dateValue);
      newDate.setDate(1);
      const month = newDate.getMonth();
      newDate.setMonth(month+1);
      newDate.setDate(0);
      return newDate.getDate();
    },
    isBefore(compareDate, type) {
      if (!compareDate) {
        return true
      }
      if (type === 'd') {
        return dateValue.getTime() < new Date(dayjs(compareDate).subtract(1, 'd').format('yyyy-mm-dd')).getTime() // (new Date(compareDate).getTime() - 86400000)
      } else if (type === 'm') {
        return dateValue.getTime() < new Date(dayjs(compareDate).subtract(1, 'm').format('yyyy-mm-dd')).getTime() // (new Date(compareDate).getTime() - 86400000 * dayjs().subtract(1, 'm').daysInMonth())
      } else if (type === 'y') {
        return dateValue.getTime() < new Date(dayjs(compareDate).subtract(1, 'y').format('yyyy-mm-dd')).getTime() //(new Date(compareDate).getTime() - 86400000 * dayjs().subtract(1, 'm').daysInMonth() * 12)
      } else {
        return dateValue.getTime() < new Date(compareDate).getTime()
      }
    },
    isAfter(compareDate, type) {
      if (!compareDate) {
        return true
      }
      if (type === 'd') {
        return dateValue.getTime() > new Date(dayjs(compareDate).subtract(-1, 'd').format('yyyy-mm-dd')).getTime() // (new Date(compareDate).getTime() - 86400000)
      } else if (type === 'm') {
        return dateValue.getTime() > new Date(dayjs(compareDate).subtract(-1, 'm').format('yyyy-mm-dd')).getTime() // (new Date(compareDate).getTime() - 86400000 * dayjs().subtract(1, 'm').daysInMonth())
      } else if (type === 'y') {
        return dateValue.getTime() > new Date(dayjs(compareDate).subtract(-1, 'y').format('yyyy-mm-dd')).getTime() //(new Date(compareDate).getTime() - 86400000 * dayjs().subtract(1, 'm').daysInMonth() * 12)
      } else {
        return dateValue.getTime() > new Date(compareDate).getTime()
      }
    },
  }
}