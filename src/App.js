import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';

const App = () => {

  // Переменные состояния //
  
  // Массивы пользователей (два массива, чтобы один был оригинальным для поиска)
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);

  // Текущий поисковой запрос
  const [searchQuery, setSearchQuery] = useState('');

  // Конфигурация сортировки
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  // Информация о выбранном пользователе
  const [infoUser, setInfoUser] = useState(null);

  // Состояние модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Хранение ошибок
  const [error, setError] = useState(null);

  // Хранение ссылки на DOM
  const tableRef = useRef(null);


  // Хук эффектов, выполняется один раз
  useEffect(() => {

    // Получение и преобразование списка пользователей JSON -> JS
    fetch('https://dummyjson.com/users')
      .then(response => response.json())
      .then(data => {
        setUsers(data.users);
        setOriginalUsers(data.users);
      })

      // Блок кода для ошибок
      .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
        setError('Ошибка при загрузке данных');
      });
  }, []);


  // Функция для поиска
  const handleSearch = (event) => {
    
    // Получаем значение из строки поиска
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  
    // Если запрос пустой, возвращаем всех пользователей
    if (query.trim() === '') {
      setUsers(originalUsers);
    } else {
      fetch(`https://dummyjson.com/users`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Ошибка сети');
          }
          return response.json();
        })
        .then(data => {
          const filtrUsers = data.users.filter(user => {
            const fullName = `${user.firstName} ${user.lastName} ${user.maidenName}`.toLowerCase();
            const address = `${user.address.city}, ${user.address.address}`.toLowerCase();
            
            // Проверка, содержится ли строка поиска в данных и возвращаем только найденных пользователей
            return (
              fullName.includes(query) ||
              user.age.toString().includes(query) ||
              user.gender.toLowerCase().includes(query) ||
              user.phone.includes(query) ||
              address.includes(query)
            );
          });
  
          // Если есть найденные пользователи, то сохраняем их в setUsers
          if (filtrUsers.length > 0) {
            setUsers(filtrUsers);
            setError(null);

          // Если нет совпадений, то...
          } else {
            setUsers([]);
            setError('Ничего не найдено');
          }
        })
        .catch(error => {
          console.error('Ошибка при поиске пользователей:', error);
          setError('Ошибка при поиске пользователей');
        });
    }
  };


// Функция для сортировки данных
const handleSort = (key) => {
  let direction = 'asc';

  // Определение направления сортировки
  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
    direction = '';
  }

  setSortConfig({ key, direction });

  // Если установлена сортировка, то...
  if (direction !== '') {
    const sortedUsers = [...users].sort((a, b) => {

      // Два сравниваемых объекта
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'fullName') {
        aValue = `${a.firstName} ${a.lastName} ${a.maidenName}`;
        bValue = `${b.firstName} ${b.lastName} ${b.maidenName}`;
      }

      if (key === 'address') {
        aValue = `${a.address.city} ${a.address.address}`;
        bValue = `${b.address.city} ${b.address.address}`;
      }

      // Сравнение значений a и b
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Обновление состояния setUsers
    setUsers(sortedUsers);
  } else {
    // Так как при 3 клике на сортировку она должна показывать значение по умолчанию, возникала такая ситуация
    // Что если перед сортировкой был поиск пользователей, то он сбрасывался, для этого была написана эта часть кода,
    // Чтобы при 3 клике на сортировку сохранялся и поиск
    const filtrUsers = originalUsers.filter(user => {
      const fullName = `${user.firstName} ${user.lastName} ${user.maidenName}`.toLowerCase();
      const address = `${user.address.city}, ${user.address.address}`.toLowerCase();
      return (
        fullName.includes(searchQuery) ||
        user.age.toString().includes(searchQuery) ||
        user.gender.toLowerCase().includes(searchQuery) ||
        user.phone.includes(searchQuery) ||
        address.includes(searchQuery)
      );
    });
    setUsers(filtrUsers);
  }
};


  // Открытие и закрытие модального окна
  const openModal = (user) => {
    setInfoUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setInfoUser(null);
    setIsModalOpen(false);
  };


  // Функция для изменения ширины колонок
  useEffect(() => {

    // Получение заголовков таблицы для манипуляций
    const table = tableRef.current;
    const cols = table.querySelectorAll('th');
  
    // Проходимся по каждому элементу заголовка
    cols.forEach((col) => {
      const resiz = document.createElement('div');
      resiz.className = 'resiz';
      col.appendChild(resiz);
  
      // Добавляем слушатель события на элемент resize
      resiz.addEventListener('mousedown', (e) => {

        // Сохраняем начальную позицию курсора и ширину столбца
        const startX = e.pageX;
        const startWidth = col.offsetWidth;
  
        // Функция для перемещения мыши
        const onMouseMove = (e) => {

          // Вычисляем новую ширину столбца
          const newWidth = startWidth + (e.pageX - startX);
          if (newWidth > 50) {
            col.style.width = `${newWidth}px`;
          }
        };
  
        // Функция при отпускании кнопки мыши
        const onMouseUp = () => {

          // Удаляем слушателей событий
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.body.style.cursor = 'default';
          document.body.style.userSelect = 'auto';
        };
  
        // Добавляем слушателей событий
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      });
    });
  }, [users]);

  return (
    <div className="app-container">
      <h1>Список пользователей</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {error && <p>{error}</p>}

      <table ref={tableRef} className="users-table">
      <thead>
          <tr>
            <th onClick={() => handleSort('fullName')}>
              ФИО {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
            </th>
            <th onClick={() => handleSort('age')}>
              Возраст {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
            </th>
            <th onClick={() => handleSort('gender')}>
              Пол {sortConfig.key === 'gender' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
            </th>
            <th onClick={() => handleSort('phone')}>
              Телефон {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
            </th>
            <th onClick={() => handleSort('address')}>
              Адрес {sortConfig.key === 'address' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} onClick={() => openModal(user)}>
              <td>{`${user.firstName} ${user.lastName} ${user.maidenName}`}</td>
              <td>{user.age}</td>
              <td>{user.gender}</td>
              <td>{user.phone}</td>
              <td>{`${user.address.city}, ${user.address.address}`}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && <Modal user={infoUser} onClose={closeModal} />}
    </div>
  );
};

export default App;
