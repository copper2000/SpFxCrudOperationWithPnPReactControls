import * as React from 'react';
import styles from './HelloSpFxReactControl.module.scss';
import { IHelloSpFxReactControlProps } from './IHelloSpFxReactControlProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { DatePicker, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { sp, Web, IWeb } from "@pnp/sp/presets/all";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

export interface IStates {
  Items: any;
  ID: any;
  EmployeeName: any;
  EmployeeNameId: any;
  HireDate: any;
  JobDescription: any;
  HTML: any;
}

export default class HelloSpFxReactControl extends React.Component<IHelloSpFxReactControlProps, IStates> {
  constructor(props) {
    super(props);
    this.state = {
      Items: [],
      ID: 0,
      EmployeeName: "",
      EmployeeNameId: 0,
      HireDate: null,
      JobDescription: "any",
      HTML: []
    };
  }

  public async componentDidMount() {
    await this.fetchData();
  }

  public async fetchData() {
    let web = Web(this.props.webURL);
    const items: any[] = await web.lists.getByTitle("EmployeeDetails").items.get();
    console.log(items);

    this.setState({
      Items: items
    });

    let html = await this.getHTML(items);
    this.setState({
      HTML: html
    });
  }

  public async getHTML(items: any[]) {
    var tableData = <table className={styles.table}>
      <thead>
        <tr>
          <th>Employee</th>
          <th>Hire Date</th>
          <th>Job Description</th>
        </tr>
      </thead>
      <tbody>
        {items && items.map((item, index) => {
          return [
            <tr key={index} onClick={() => this.findData(item.ID)}>
              <td>{item.Title}</td>
              <td>{FormatDate(item.HireDate)}</td>
              <td>{item.JobDescription}</td>
            </tr>
          ];
        })}
      </tbody>
    </table>;

    return await tableData;
  }

  public findData = (id: number): void => {
    var itemID = id;
    var allItems = this.state.Items;
    var allItemsLength = allItems.length;
    if (allItemsLength > 0) {
      for (var i = 0; i < allItemsLength; i++) {
        if (itemID == allItems[i].Id) {
          this.setState({
            ID: itemID,
            EmployeeName: allItems[i].Title,
            EmployeeNameId: allItems[i].ID,
            HireDate: new Date(allItems[i].HireDate),
            JobDescription: allItems[i].JobDescription
          });
        }
      }
    }
  }

  private async SaveData() {
    let web = Web(this.props.webURL);

    await web.lists.getByTitle("EmployeeDetails").items.add({
      ID: this.state.EmployeeNameId,
      HireDate: new Date(this.state.HireDate),
      JobDescription: this.state.JobDescription
    }).then(i => {
      console.log(i);
    });

    alert("Created successfully");

    this.setState({
      EmployeeName: "",
      HireDate: null,
      JobDescription: ""
    });

    this.fetchData();
  }

  private async UpdateData() {
    let web = Web(this.props.webURL);
    await web.lists.getByTitle("EmployeeDetails").items.getById(this.state.ID).update({
      ID: this.state.EmployeeNameId,
      Title: this.state.EmployeeName,
      HireDate: this.state.HireDate,
      JobDescription: this.state.JobDescription
    }).then(i => {
      console.log(i);
    });
    alert("Updated Successfully");
    this.setState({ EmployeeName: "", HireDate: null, JobDescription: "" });
    this.fetchData();;
  }

  private async DeleteData() {
    let web = Web(this.props.webURL);
    await web.lists.getByTitle("EmployeeDetails").items.getById(this.state.ID).delete()
      .then(i => {
        console.log(i);
      });
    alert("Deleted Successfully");
    this.setState({ EmployeeName: "", HireDate: null, JobDescription: "" });
    this.fetchData();
  }

  public render(): React.ReactElement<IHelloSpFxReactControlProps> {
    return (
      <div>
        <h1>CRUD Operations using React SpFx Controls</h1>
        {this.state.HTML}
        <div className={styles.btnGroup}>
          <div><PrimaryButton text='Create' onClick={() => this.SaveData()} /></div>
          <div><PrimaryButton text='Update' onClick={() => this.UpdateData()} /></div>
          <div><PrimaryButton text='Delete' onClick={() => this.DeleteData()} /></div>
        </div>
        <div>
          <form>
            <div>
              <Label>Employee Name</Label>
              <PeoplePicker
                context={this.props.context}
                personSelectionLimit={1}
                defaultSelectedUsers={[this.state.EmployeeName ? this.state.EmployeeName : ""]}
                required={false}
                onChange={this._getPeoplePickerItems}
                showHiddenInUI={false}
                principalTypes={[PrincipalType.User]}
                resolveDelay={1000}
                ensureUser={true}
              />
            </div>
            <div>
              <Label>Hire Date</Label>
              <DatePicker
                maxDate={new Date()}
                allowTextInput={false}
                strings={DatePickerStrings}
                value={this.state.HireDate}
                onSelectDate={(e) => { this.setState({ HireDate: e }); }}
                ariaLabel="Select a date"
                formatDate={FormatDate}
              />
            </div>
            <div>
              <Label>Job Description</Label>
              <TextField
                value={this.state.JobDescription}
                multiline
                onChange={(value) => this.onchange(value, "JobDescription")}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export const DatePickerStrings: IDatePickerStrings = {
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  goToToday: 'Go to today',
  prevMonthAriaLabel: 'Go to previous month',
  nextMonthAriaLabel: 'Go to next month',
  prevYearAriaLabel: 'Go to previous year',
  nextYearAriaLabel: 'Go to next year',
  invalidInputErrorMessage: 'Invalid date format.'
};

export const FormatDate = (date): string => {
  console.log(date);
  var date1 = new Date(date);
  var year = date1.getFullYear();
  var month = (1 + date1.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date1.getDate().toString();
  day = day.length > 1 ? day : '0' + day;

  return month + '/' + day + '/' + year;
};

