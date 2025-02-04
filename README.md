Разработать клиент-серверное приложение, реализующее функциональные
требования (CRUD-операции), заданные в пределах указанной предметной области, с
соблюдением следующих технических требований:
• Клиентская сторона приложения должна быть разработана с использованием
языка разметки HTML, таблиц стилей CSS и языка программирования JavaScript.
Разрешено использовать любую библиотеку/фреймворк для построения
пользовательского веб-интерфейса.
• Серверная сторона приложения должна быть разработана с использованием
языка программирования JavaScript и платформы Node.js. Разрешено
использовать любую библиотеку/фреймворк для создания сервера.
• Взаимодействие между клиентом и сервером должно осуществляться через
спроектированный REST-like API.
• Данные на серверной стороне должны храниться в базе данных. Разрешено
использовать любую БД и СУБД, к которой возможно подключиться из JavaScriptкода.
• Вместо JavaScript разрешено использовать TypeScript.
 Приложение представляет собой раздел личного кабинета менеджера HR-отдела
компании-разработчика ПО, отвечающий за назначение технических собеседований
специалистам. В разделе указывается список специалистов компании с возможностью
добавления специалиста в список, удаления его из списка и редактирования информации
о нем. Информация о специалисте: ФИО сотрудника (строка), ID (строка,
нередактируемый атрибут), диапазон времени, когда специалист доступен (время начала
и окончания диапазона в часах и минутах), набор навыков (множественный выбор из
списка). Перечень навыков задается изначально и может быть дополнен из интерфейса
приложения. Для специалиста указывается список назначенных ему собеседований, в
него можно добавлять собеседования, удалять их из списка, а также переводить
собеседование с одного специалиста на другого. Параметры собеседования: ФИО
соискателя (строка), ID (строка, нередактируемый атрибут), время прихода соискателя
(в часах и минутах), набор навыков (множественный выбор из списка). Все
собеседования длятся фиксированное время (M часов N минут).  Специалист может
провести собеседование, если совпадает минимум 80% навыков у него и соискателя. При
добавлении/изменении параметров собеседования необходимо проверить, нет ли
пересечения по времени с уже имеющимися собеседованиями и может ли этот
специалист провести собеседование. Если пересечение имеется или специалист не
может провести собеседование - должно отобразиться уведомление-предупреждение о
невозможности выполнения данной операции.
