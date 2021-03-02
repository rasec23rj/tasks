import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Platform
  
} from "react-native";
import moment from "moment";
import "moment/locale/pt-br";
import axios from 'axios'
import { server, showError } from '../common'
import todayImage from "../../assets/imgs/today.jpg";
import commonStyles from "../commonStyles";
import Tasks from "../component/Tasks";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AddTasks from "./AddTasks";
import ActionButton from "react-native-action-button";
import AsyncStorage from '@react-native-community/async-storage';

export default class Agenda extends Component {
  state = {
    tasks: [],
    visibleTasks: [],
    showDoneTasks: true,
    showAddTask: false
  };

  addTask = async task => {
   try {
     await axios.post(`${server}/task`, {
       desc: task.desc,
       estimateAt: task.date
     })
   } catch (err) {
     showError(err)
   }

    this.setState({ tasks, showAddTask: false }, this.loadTasks);
  };
  deleteTask = async id => {
    console.log('id');
    try {
      await axios.delete(`${server}/task/${id}`)
      await this.loadTasks()
    } catch (err) {
      showError(err)
    }
  }
  filterTasks = () => {
    let visibleTasks = null;
    if (this.state.showDoneTasks) {
      visibleTasks = [...this.state.tasks];
      
    } else {
      const pending = task => task.doneAt === null;
      visibleTasks = this.state.tasks.filter(pending);
    }
    this.setState({ visibleTasks });
    
  //  AsyncStorage.setItem('tasks', JSON.stringify(this.state.tasks))
  };

  toggleFilter = () => {
    this.setState(
      { showDoneTasks: !this.state.showDoneTasks },
      this.filterTasks()
     
    );
  };
  componentDidMount = async () => {
   
    this.loadTasks()


  }
  toggleTask = async id => {
    console.log('id', id);
    try {
      await axios.put(`${server}/tasks/${id}/toggle`)
      await this.loadTasks()
    } catch (err) {
      console.log('id', id);
      showError(err)
    }
  }

loadTasks = async () => {
  try {
    const maxDate = moment().format('YYYY-MM-DD 23:59')
    const res = await axios.get(`${server}/tasks?date=${maxDate}`)
    this.setState({ tasks: res.data }, this.filterTasks)

  } catch (err) {
    showError(err)
  }
}
  render() {
    return (
      <View style={styles.container}>
        <AddTasks
          isVisible={this.state.showAddTask}
          onSave={this.addTask}
          onCancel={() => this.setState({ showAddTask: false })}
        />
        <ImageBackground source={todayImage} style={styles.background}>
          <View style={styles.iconBar}>
            <TouchableOpacity onPress={this.toggleFilter}>
              <Icon
                name={this.state.showDoneTasks ? "eye" : "eye-off"}
                size={20}
                color={commonStyles.colors.secondary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.titleBar}>
            <Text style={styles.title}>Hoje</Text>
            <Text style={styles.title}>
              {moment()
                .locale("pt-br")
                .format("ddd, D [de] MMMM")}
            </Text>
          </View>
        </ImageBackground>
        <View style={styles.tasksContainer}>
          <FlatList
            data={this.state.visibleTasks}
            keyExtractor={item => `${item.id}`}
            renderItem={({ item }) =>
              <Tasks {...item} toggleTask={this.toggleTask}
                       onDelete={this.deleteTask} />
            }
          />
        </View>
        <ActionButton
          buttonColor={commonStyles.colors.today}
          onPress={() => {
            this.setState({ showAddTask: true });
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  background: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleBar: {
    flex: 1,
    justifyContent: "flex-end"
  },
  title: {
    fontFamily: commonStyles.fontFamily,
    color: commonStyles.colors.secondary,
    fontSize: 50,
    marginLeft: 20,
    marginBottom: 10
  },
  subtitle: {
    fontFamily: commonStyles.fontFamily,
    color: commonStyles.colors.secondary,
    fontSize: commonStyles.fontSize,
    marginLeft: 20,
    marginBottom: 30
  },
  tasksContainer: {
    flex: 3,
    fontFamily: commonStyles.fontFamily
  },
  iconBar: {
    marginTop: Platform.OS === "ios" ? 30 : 10,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end"
  }
});
