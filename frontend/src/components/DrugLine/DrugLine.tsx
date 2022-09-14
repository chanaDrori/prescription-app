import React, { FC } from 'react';
import styles from './DrugLine.module.css';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { IconButton } from '@mui/material';
import { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ClearIcon from '@mui/icons-material/Clear';
import { DrugDetail } from '../../Interfaces';

interface DrugLineProps extends DrugDetail {
  onClickDeleteMe: (id: string) => void;
}

class DrugLine extends React.Component<DrugLineProps, { value: any }>{

  constructor(props: DrugLineProps) {
    super(props);

    this.state = {
      value: undefined
    }
    // this.onClickDelete = this.onClickDelete.bind(this);
  }

  onClickDelete() {
    this.props.onClickDeleteMe(this.props.id);
  }

  render() {
    const { value } = this.state;
    return (
      <ListItem className={styles.DrugLine}>
        <ListItemText primary={this.props.name} secondary={this.props.details} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            // label="Basic example"
            value={value}
            onChange={(newValue) => {
              this.setState({value: newValue})
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <ListItemIcon onClick={this.onClickDelete.bind(this)}>
          <IconButton >
            <ClearIcon />
          </IconButton>
        </ListItemIcon>
      </ListItem>
    );
  }

}

export default DrugLine;
