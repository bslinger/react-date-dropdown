import React, {Component} from "react";
import Dropdown from "react-dropdown";
import moment from "moment";
import range from "lodash/range";

class DateSelect extends Component {
    constructor(params) {
        super(params);
        this.state = {
            selectedYear: null,
            selectedMonth: null,
            selectedDayOfMonth: null,
            daysOfMonth: [],
            months: [],
            years: []
        };

        this.onMonthChange = this.onMonthChange.bind(this);
        this.onYearChange = this.onYearChange.bind(this);
        this.onDayOfMonthChange = this.onDayOfMonthChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.findNumberOfDaysInMonth = this.findNumberOfDaysInMonth.bind(this);
        this.init = this.init.bind(this);
    }

    init() {
        const dateObject = this.props.initialValue ? moment(moment(this.props.initialValue).format(this.props.format || "YYYY-MM-DD")) : null;
        let startRange = this.props.startRange ? moment(moment(this.props.startRange).format(this.props.format || "YYYY-MM-DD")) : null || moment().subtract(100, 'years');
        let endRange = this.props.endRange ? moment(moment(this.props.endRange).format(this.props.format || "YYYY-MM-DD")) : null || moment().add(20, 'years');

        if(dateObject){
            if (endRange.isBefore(startRange)) {
                throw new Error ("End Date should be greater than start Date");
            }else if (startRange.isAfter(dateObject)) {
                throw new Error ("Start Date is after initial date");
            }else if(endRange.isBefore(dateObject)){
                throw new Error ("End Date is before initial date");
            }
        }

        let years = range(startRange.year(), endRange.year());
        let months = range(1, 13).map((thisMonth) => {
            return {
                value: thisMonth,
                label: moment(`${thisMonth}`, "MM").format("MMMM").toUpperCase()
            }
        });

        let fullMonthList = JSON.parse(JSON.stringify(months));
        let startMonthDate = 1;
        let endMonthDate = 31;
        if (dateObject) {
            if (dateObject.year() == startRange.year()) {
                let startMonth = startRange.month() + 1;
                months = range(startMonth, 13).map((thisMonth) => {
                    return {
                        value: thisMonth,
                        label: moment(`${thisMonth}`, "MM").format("MMMM").toUpperCase()
                    }
                });
                if (dateObject.month() == startRange.month()) {
                    startMonthDate = startRange.date();
                }
            }
            if (dateObject.year() == endRange.year()) {
                let endMonth = endRange.month() + 1;
                months = months.filter((month) => {
                    return month.value <= endMonth
                });
                if (dateObject.month() == endRange.month()) {
                    endMonthDate = endRange.date();
                }
            }
        }
        let daysOfMonth = range(startMonthDate, endMonthDate + 1);

        this.setState({
            fullMonthList: fullMonthList,
            startRange: startRange,
            endRange: endRange,
            daysOfMonth: daysOfMonth,
            months: months,
            years: years,
            selectedYear: dateObject ? dateObject.year() : null,
            selectedMonth: dateObject ? dateObject.month() + 1 : null,
            selectedDayOfMonth: dateObject ? dateObject.date() : null,
        }, () => {
            if (this.state.selectedYear && this.state.selectedMonth) {
                this.findNumberOfDaysInMonth(true);
            }
        });
    }

    onChange() {
        const year = this.state.selectedYear;
        const month = this.state.selectedMonth;
        const dayOfMonth = this.state.selectedDayOfMonth;
        const formattedValue = moment(`${year}-${month}-${dayOfMonth}`).format(this.props.format || "YYYY-MM-DD");
        const value = moment(formattedValue);
        this.props.onChange(value, formattedValue);
    }

    findNumberOfDaysInMonth(noCallbackNeeded) {
        const _self = this;
        const MM = this.state.selectedMonth;
        const YYYY = this.state.selectedYear;
        if (MM && YYYY) {
            let startDate = 1;
            let endDate = 31;
            if (MM == this.state.startRange.month() + 1 && YYYY == this.state.startRange.year()) {
                startDate = this.state.startRange.date();
            }
            if (MM == this.state.endRange.month() + 1 && YYYY == this.state.endRange.year()) {
                endDate = this.state.endRange.date();
            }
            const numberOfDaysInMonth = moment(`${MM}-${YYYY}`, 'MM-YYYY').daysInMonth();
            endDate = endDate < numberOfDaysInMonth ? endDate : numberOfDaysInMonth;
            _self.setState({daysOfMonth: range(startDate, endDate + 1)}, () => {
                if (_self.state.selectedDayOfMonth && _self.state.selectedDayOfMonth > endDate) {
                    this.setState({selectedDayOfMonth: 1}, () => {
                        !noCallbackNeeded && _self.onChange();
                    })
                } else if (_self.state.selectedDayOfMonth && _self.state.selectedDayOfMonth <= endDate) {
                    !noCallbackNeeded && _self.onChange();
                }
            })
        }
    }

    onYearChange(year) {
        let months = JSON.parse(JSON.stringify(this.state.fullMonthList));
        let selectedMonth = this.state.selectedMonth;
        if (year.value == this.state.startRange.year()) {
            let startMonth = this.state.startRange.month() + 1;
            months = range(startMonth, 13).map((thisMonth) => {
                return {
                    value: thisMonth,
                    label: moment(`${thisMonth}`, "MM").format("MMMM").toUpperCase()
                }
            });
            if (this.state.selectedMonth < startMonth) {
                selectedMonth = startMonth;
            }
        }
        console.log(`the value for year is ${year.value} and value for end year is ${this.state.endRange.year()}`)
        if (year.value == this.state.endRange.year()) {
            let endMonth = this.state.endRange.month() + 1;
            months = months.filter((month) => {
                return month.value <= endMonth
            });
            if (this.state.selectedMonth > endMonth) {
                selectedMonth = endMonth;
            }
        }
        this.setState({
            selectedYear: year.value,
            months: months,
            selectedMonth: selectedMonth
        }, this.findNumberOfDaysInMonth);
    }

    onMonthChange(month) {
        this.setState({selectedMonth: month.value}, this.findNumberOfDaysInMonth);
    }

    onDayOfMonthChange(day) {
        this.setState({selectedDayOfMonth: day.value}, this.onChange);
    }

    componentWillMount() {
        this.init();
    }

    render() {
        return (
            <div className={"select-datepicker"}>
                {
                    this.state.selectedMonth ?
                        <Dropdown className={"select-month"} options={this.state.months}
                                  value={ {
                                      value: this.state.selectedMonth,
                                      label: moment(`${this.state.selectedMonth}`, "MM").format("MMMM").toUpperCase()
                                  }}
                                  placeholder={"MM"}
                                  onChange={this.onMonthChange}/>
                        : <Dropdown className={"select-month"} options={this.state.months}
                                    placeholder={"MM"}
                                    onChange={this.onMonthChange}/>
                }
                {   this.state.selectedDayOfMonth ?
                    <Dropdown className={"select-date"} options={this.state.daysOfMonth} placeholder={"DD"}
                              value={ {value: this.state.selectedDayOfMonth, label: this.state.selectedDayOfMonth}}
                              onChange={this.onDayOfMonthChange}/>
                    : <Dropdown className={"select-date"} options={this.state.daysOfMonth} placeholder={"DD"}
                                onChange={this.onDayOfMonthChange}/>
                }
                {
                    this.state.selectedYear ?
                        <Dropdown className={"select-year"} options={this.state.years}
                                  value={ {value: this.state.selectedYear, label: this.state.selectedYear}}
                                  placeholder={"YYYY"}
                                  onChange={this.onYearChange}/>
                        : <Dropdown className={"select-year"} options={this.state.years}
                                    placeholder={"YYYY"}
                                    onChange={this.onYearChange}/>
                }
            </div>

        )
    }


}

export default DateSelect;