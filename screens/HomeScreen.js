import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Button,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'Medium',
    status: 'Incomplete',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('priority');
  const [editingTask, setEditingTask] = useState(null);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newTask.dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setNewTask({ ...newTask, dueDate: currentDate });
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const addTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      Alert.alert('Validation Error', 'Title and description cannot be empty.');
      return;
    }
  
    const taskData = {
      email: 'monishka',  
      task_title: newTask.title,
      task_desc: newTask.description,
      due_date: newTask.dueDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      priority: newTask.priority === "High" ? 2 : newTask.priority === "Low" ? 0 : 1,
      status: newTask.status === "Incomplete" ? 0 : 1,
    };
  
    try {
      const response = await fetch("https://task-app-api-nine.vercel.app/api/add-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth":"ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU="
        },
        body: JSON.stringify(taskData),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setTasks([...tasks, { ...newTask, id: result.task_id || Date.now().toString() }]);
        Alert.alert("Success", "Task added successfully!");
      } else {
        Alert.alert("Error", result.message || "Failed to add task.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  
    setNewTask({
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "Medium",
      status: "Incomplete",
    });
  
    setModalVisible(false);
  };
  

  const deleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            setTasks(tasks.filter(task => task.id !== taskId));
          },
          style: 'destructive'
        }
      ]
    );
  };

  const editTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
    });
    setModalVisible(true);
  };

  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'Incomplete' ? 'Complete' : 'Incomplete' }
        : task
    ));
  };

  const filterTasks = (tasks) => {
    if (!searchQuery.trim()) return tasks;
  
    return tasks.filter((task) => {
      if (filterType === 'priority') {
        return task.priority.toLowerCase().includes(searchQuery.toLowerCase());
      } else if (filterType === 'dueDate') {
        const taskDueDate = task.dueDate.toLocaleDateString();
        return taskDueDate.includes(searchQuery);
      }
      return false;
    });
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskDetails}>
        <View style={styles.taskHeader}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => toggleTaskStatus(item.id)}
          >
            <Icon 
              name={item.status === 'Complete' ? 'checkbox-outline' : 'square-outline'} 
              size={24} 
              color={item.status === 'Complete' ? '#4CAF50' : '#ff6b6b'} 
            />
          </TouchableOpacity>
          <Text style={[
            styles.taskTitle,
            item.status === 'Complete' && styles.completedTask
          ]}>{item.title}</Text>
          <View style={styles.taskActions}>
            <TouchableOpacity 
              onPress={() => editTask(item)}
              style={styles.actionButton}
            >
              <Icon name="create-outline" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteTask(item.id)}
              style={styles.actionButton}
            >
              <Icon name="trash-outline" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.taskDesc}>{item.description}</Text>
        <Text style={styles.taskInfo}>
          Due: {item.dueDate.toLocaleDateString()} | Priority: {item.priority}
        </Text>
        <Text style={[
          styles.statusText, 
          { color: item.status === 'Complete' ? '#4CAF50' : '#ff6b6b' }
        ]}>
          Status: {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jot down things to "achieve"</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search by ${filterType === 'priority' ? 'Priority' : 'Due Date (MM/DD/YYYY)'}`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setFilterType(filterType === 'priority' ? 'dueDate' : 'priority')}>
          <Icon name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => {
        setEditingTask(null);
        setNewTask({
          title: '',
          description: '',
          dueDate: new Date(),
          priority: 'Medium',
          status: 'Incomplete',
        });
        setModalVisible(true);
      }}>
        <Icon name="add-circle" size={36} color="#000" />
      </TouchableOpacity>

      <FlatList
        data={filterTasks(tasks)}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks found!</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Task Description"
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
            />
            
            <TouchableOpacity
              style={styles.datePicker}
              onPress={showDatepicker}
            >
              <Text>Select Due Date: {newTask.dueDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={newTask.dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                style={Platform.OS === 'ios' ? styles.datePickerIOS : {}}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Priority (Low, Medium, High)"
              value={newTask.priority}
              onChangeText={(text) => setNewTask({ ...newTask, priority: text })}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" color={'#000'} onPress={() => setModalVisible(false)} />
              <Button title={editingTask ? 'Update Task' : 'Save Task'} onPress={addTask} color={'#000'} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fc',
  },
  title: {
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
  },
  addButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    marginRight: 10,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginLeft: 34,
  },
  taskInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginLeft: 34,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
    marginLeft: 34,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  datePicker: {
    backgroundColor: '#eaeaea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  datePickerIOS: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  taskActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
});

export default HomeScreen;