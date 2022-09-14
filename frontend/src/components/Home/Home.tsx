import React from 'react';
import styles from './Home.module.css';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import RequestService from '../../services/SearchService'
import { Alert, Autocomplete, AutocompleteInputChangeReason, Button, Card, TextField, Typography } from '@mui/material';
import DrugLine from '../DrugLine/DrugLine';
import { HomeState, DrugDetail, WarningComb } from '../../Interfaces';


export default class Home extends React.Component<{}, HomeState>{

  private requestService = new RequestService();

  constructor(props: {}) {
    super(props);
    const data: DrugDetail[] = [];
    const options: DrugDetail[] = [];
    const warnings_list: WarningComb[] = [];
    this.state = {
      data: data,
      options: options,
      warningsList: warnings_list,
      selectedDrug: undefined
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
    this.onSelectDrug = this.onSelectDrug.bind(this);
    this.onAddDrug = this.onAddDrug.bind(this);
    this.setOptions = this.setOptions.bind(this);
    this.setErrorMessageSearch = this.setErrorMessageSearch.bind(this);
  }

  setOptions(options: DrugDetail[]) {
    this.setState({ options: options });
    this.setState({ errorMessageSearch: "" });
  }

  setErrorMessageSearch(message: string) {
    this.setState({ errorMessageSearch: message });
  }

  onClickDeleteMe(id: string) {
    let newData = this.state.data.filter(d => d.id != id);
    this.setState({ data: newData }, () => this.updateWarning())
  }

  async updateWarning() {
    const listId = this.state.data.map(d => d.id);
    if (listId.length == 0) { return; }
    const response = await this.requestService.getWarnings(listId);
    let warningsList: WarningComb[] = [];
    if (response.status != 200) {
      warningsList.push({ description: response.data, severity: "error" });
    }
    else {
      const validSeverity = ["error", "info", "warning"];
      warningsList = response.data.data.map((e: any) => {
        let severity = "info";
        if (validSeverity.filter(s => s == e.severity).length > 0) {
          severity = e.severity;
        }
        return {
          description: e.description,
          severity: severity
        }
      });
    }
    this.setState({ warningsList: warningsList })

  }

  onInputSearchChange(event: React.SyntheticEvent<Element, Event>, value: string, reason: AutocompleteInputChangeReason) {
    if (value) {
      // value is from options
      if (this.state.options.filter(d => d.name == value).length != 0) {
        return;
      }
      this.requestService.getData(value, this.setOptions, this.setErrorMessageSearch);
    }
    else {
      this.setState({ errorMessageSearch: "" });
    }
  }

  onAddDrug() {
    const { selectedDrug } = this.state;
    if (selectedDrug) {
      let { data: newData } = this.state;
      if (newData.filter(d => selectedDrug && d.id == selectedDrug.id).length > 0) {
        alert("Sorry, The drug is already on your list.");
        return;
      }
      newData.push(selectedDrug);
      this.setState({ data: newData, value: undefined }, () => this.updateWarning());
    }
  }

  onSelectDrug(event: any, value?: DrugDetail | null) {
    if (value == null) {
      value = undefined;
    }
    this.setState({ selectedDrug: value });
  }

  render(): React.ReactNode {
    const { value, errorMessageSearch, warningsList, data, selectedDrug } = this.state;
    return (
      <div className={styles.Home}>
        <h1>
          Drug Prescription App
        </h1>

        {
          errorMessageSearch ?
            <Typography variant="subtitle1" gutterBottom>
              {errorMessageSearch}
            </Typography>
            :
            null
        }
        <Autocomplete
          className={styles.Autocomplete}
          id="combo-box-demo"
          onInputChange={this.onInputSearchChange}  // on every input change hitting the api
          onChange={this.onSelectDrug} // click on the selected
          getOptionLabel={(option: DrugDetail) => option.name}
          options={this.state.options}
          isOptionEqualToValue={(option: DrugDetail, value: DrugDetail) => option.name === value.name}
          renderInput={(params) => <TextField {...params} label="Start to search..." />}
          value={value}
        />
        <Button
          variant="outlined"
          onClick={this.onAddDrug}
          disabled={selectedDrug == undefined}
          sx={{ textTransform: 'none' }}>
          Add Drug
        </Button>

        <Card className={styles.Card}>
          <List className={styles.List}
            subheader={<ListSubheader>Prescription</ListSubheader>}
          >
            {
              data.map((d, idx) => {
                return (
                  <DrugLine
                    key={d.id}
                    {...d}
                    onClickDeleteMe={(id: string) => this.onClickDeleteMe(id)} />
                )
              })
            }
          </List>
        </Card>

        {
          warningsList.map((w, idx) => {
            return (
              <Alert severity={w.severity} key={idx} className={styles.Alert}>
                {w.description}
              </Alert>
            )
          })
        }
      </div>
    );
  }

}

