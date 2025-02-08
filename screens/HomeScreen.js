import React, {useState, useEffect} from 'react';
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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Snackbar} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [snackMessage, setSnackMessage] = useState('');
  const [visible, setVisible] = useState(false);
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
  const [error, setError] = useState([])

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newTask.dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setNewTask({...newTask, dueDate: currentDate});
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };
  useEffect(() => {
    const formatApiTask = (apiTask) => ({
      id: apiTask.task_id.toString(),
      title: apiTask.task_title,
      description: apiTask.task_desc,
      dueDate: new Date(apiTask.due_date),
      priority: apiTask.priority === 2 ? 'High' : apiTask.priority === 0 ? 'Low' : 'Medium',
      status: apiTask.status ? 'Complete' : 'Incomplete'
    });

    const fetchTasks = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        if (!storedEmail) {
          console.log('No email found!');
          return;
        }
        console.log('Fetching tasks for email:', storedEmail);

        const response = await fetch(
          `https://task-app-api-nine.vercel.app/api/all-task/${storedEmail}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              auth: 'ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=',
            }
          },
        );
   
        if (response.status === 200) {
          const data = await response.json();
          console.log('API Response:', data);

          const tasksArray = Array.isArray(data) ? data : [];
          const formattedTasks = tasksArray.map(formatApiTask);
          console.log('Formatted Tasks:', formattedTasks);
          setTasks(formattedTasks);
        } else {
          console.log('Failed to fetch tasks');
          setError('Failed to fetch tasks');
        }
      } catch (err) {
        console.error('Error in fetchTasks:', err);
        setError('Something went wrong. Please try again.');
      }
    };
  
    fetchTasks();
  }, []);

  const handleSubmit = () => {
    if (editingTask) {
      updateTask();
    } else {
      addTask();
    }
  };
 
  const addTask = async () => {
    const storedEmail = await AsyncStorage.getItem('email'); // get stored email as well
    if (!storedEmail) {
      setSnackMessage('Something went wrong. Please try again.');
      return;
    }

    if (!newTask.title.trim() || !newTask.description.trim()) {
      setSnackMessage('Title and description cannot be empty.');
      return;
    }

    try {
      if (storedEmail) {
        console.log('Stored email: ', storedEmail);
        const taskData = {
          email: storedEmail, // async storage se nikali
          task_title: newTask.title,
          task_desc: newTask.description,
          due_date: newTask.dueDate.toISOString().split('T')[0], // date conversion
          priority:
            newTask.priority === 'High'
              ? 2
              : newTask.priority === 'Low'
              ? 0
              : 1,
          status: newTask.status === 'Incomplete' ? 0 : 1,
        };

        const response = await fetch(
          'https://task-app-api-nine.vercel.app/api/add-task',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              auth: 'ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=',
            },
            body: JSON.stringify(taskData),
          },
        );

        const result = await response.json();

        if (response.ok) {
          setTasks([
            ...tasks,
            {...newTask, id: result.task_id || Date.now().toString()},
          ]);
          setSnackMessage('Task added successfully!');
        } else {
          setSnackMessage('Task failed!');
        }
      } else {
        setSnackMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setSnackMessage('Something went wrong. Please try again.');
    }

    setNewTask({
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 'Medium',
      status: 'Incomplete',
    });

    setModalVisible(false);
  };

  const deleteTask = taskId => {
    Alert.alert(
      'Delete Task', 
      `Are you sure you want to delete task with ID: ${taskId}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://task-app-api-nine.vercel.app/api/delete-task/${taskId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    auth: 'ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=',
                  }
                }
              );
  
              if (response.ok) {
                // successful
                setTasks(tasks.filter(task => task.id !== taskId));
                setSnackMessage('Task deleted successfully!');
                setVisible(true);
              } else {
                setSnackMessage('Failed to delete task!');
                setVisible(true);
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              setSnackMessage('Something went wrong while deleting task.');
              setVisible(true);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const updateTask = async () => {
    const storedEmail = await AsyncStorage.getItem('email');
    if (!storedEmail) {
      setSnackMessage('Something went wrong. Please try again.');
      return;
    }

    if (!newTask.title.trim() || !newTask.description.trim()) {
      setSnackMessage('Title and description cannot be empty.');
      return;
    }

    try {
      const taskData = {
        email: storedEmail,
        task_title: newTask.title,
        task_desc: newTask.description,
        due_date: newTask.dueDate.toISOString().split('T')[0],
        priority: newTask.priority === 'High' ? 2 : newTask.priority === 'Low' ? 0 : 1,
        status: newTask.status === 'Incomplete' ? 0 : 1,
      };

      const response = await fetch(
        `https://task-app-api-nine.vercel.app/api/edit-task/${editingTask.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            auth: 'ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=',
          },
          body: JSON.stringify(taskData),
        },
      );

      if (response.ok) {
        setTasks(
          tasks.map(task =>
            task.id === editingTask.id
              ? {
                  ...task,
                  title: newTask.title,
                  description: newTask.description,
                  dueDate: newTask.dueDate,
                  priority: newTask.priority,
                  status: newTask.status,
                }
              : task,
          ),
        );
        setSnackMessage('Task updated successfully!');
        setVisible(true);
      } else {
        setSnackMessage('Failed to update task!');
        setVisible(true);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setSnackMessage('Something went wrong while updating task.');
      setVisible(true);
    }

    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 'Medium',
      status: 'Incomplete',
    });
    setModalVisible(false);
  };

  const editTask = task => {
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
  const toggleTaskStatus = taskId => {
    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'Incomplete' ? 'Complete' : 'Incomplete',
            }
          : task,
      ),
    );
  };

  const filterTasks = tasks => {
    if (!searchQuery.trim()) return tasks;

    return tasks.filter(task => {
      if (filterType === 'priority') {
        return task.priority.toLowerCase().includes(searchQuery.toLowerCase());
      } else if (filterType === 'dueDate') {
        const taskDueDate = task.dueDate.toLocaleDateString();
        return taskDueDate.includes(searchQuery);
      }
      return false;
    });
  };

   const renderTask = ({item}) => (
    <View style={styles.taskItem}>
      <View style={styles.taskDetails}>
        <View style={styles.taskHeader}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => toggleTaskStatus(item.id)}>
            <Icon
              name={
                item.status === 'Complete'
                  ? 'checkbox-outline'
                  : 'square-outline'
              }
              size={24}
              color={item.status === 'Complete' ? '#4CAF50' : '#ff6b6b'}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.taskTitle,
              item.status === 'Complete' && styles.completedTask,
            ]}>
            {item.title}
          </Text>
          <View style={styles.taskActions}>
            <TouchableOpacity
              onPress={() => editTask(item)}
              style={styles.actionButton}>
              <Icon name="create-outline" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteTask(item.id)}
              style={styles.actionButton}>
              <Icon name="trash-outline" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.taskDesc}>{item.description}</Text>
        <Text style={styles.taskInfo}>
          Due: {item.dueDate.toLocaleDateString()} | Priority: {item.priority}
        </Text>
        <Text
          style={[
            styles.statusText,
            {color: item.status === 'Complete' ? '#4CAF50' : '#ff6b6b'},
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
          placeholder={`Search by ${
            filterType === 'priority' ? 'Priority' : 'Due Date (MM/DD/YYYY)'
          }`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          onPress={() =>
            setFilterType(filterType === 'priority' ? 'dueDate' : 'priority')
          }>
          <Icon name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
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
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={Snackbar.LENGTH_SHORT}>
        {snackMessage}
      </Snackbar>

      <FlatList
        data={filterTasks(tasks)}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks found!</Text>
        }
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
              onChangeText={text => setNewTask({...newTask, title: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Task Description"
              value={newTask.description}
              onChangeText={text => setNewTask({...newTask, description: text})}
            />

            <TouchableOpacity
              style={styles.datePicker}
              onPress={showDatepicker}>
              <Text>
                Select Due Date: {newTask.dueDate.toLocaleDateString()}
              </Text>
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
              onChangeText={text => setNewTask({...newTask, priority: text})}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                color={'#000'}
                onPress={() => setModalVisible(false)}
              />
              <Button
                title={editingTask ? 'Update Task' : 'Save Task'}
                onPress={handleSubmit}
                color={'#000'}
              />
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
