import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect } from 'react'
import Cart from './Cart'

export type Product = {
  albumId: number,
  id: number,
  title: string,
  url: string,
  thumbnailUrl: string
}

const useFilter = (products: Product[]) => {
  const [search, setSearch] = useState("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }
  if (search === "") {
    return {
      search,
      filterProducts: products,
      handleSearchChange
    };
  } else {
    return {
      search,
      filterProducts: products.filter((product) => product.title.includes(search)),
      handleSearchChange
    }
  }
}

const useSort = (products: Product[]) => {
  const [order, setOrder] = useState("ASC");
  const copiedArray = [...products];

  const handleOrderChange = () => {
    if (order === "ASC") {
      setOrder("DESC");
    } else {
      setOrder("ASC");
    }
  }

  if (order === "ASC") {
    return {
      sorted: copiedArray.sort((a, b) => a.title.localeCompare(b.title)),
      order,
      handleOrderChange
    }
  } else {
    return {
      sorted: copiedArray.sort((a, b) => b.title.localeCompare(a.title)),
      order,
      handleOrderChange
    }
  }
}

const usePagination = () => {
  const [page, setPage] = useState(0)
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const isPreviousDisabled = page === 0

  const nextPage = () => {
    setPage(page => page + 1)
  }
  const previousPage = () => {
    setPage(page => page - 1)
  }
  const handleRecordsNumberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecordsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  return { page, recordsPerPage, isPreviousDisabled, nextPage, previousPage, handleRecordsNumberChange }
}

const useDetails = (products: Product[]) => {
  const [elementId, setElementId] = useState(null);
  console.log(elementId);

  const handleSelectedElement = (id: number) => {
    if (id == elementId) {
      setElementId(null);
    } else {
      setElementId(id);
    }
  }

  return {
    productDetails: products.find(product => product.id === elementId),
    handleSelectedElement
  }
}

const useCart = () => {
  const [cart, setCart] = useState(new Map<number, Product[]>());

  const addToCart = (product: Product) => {
    const copiedCart = new Map(cart);
    if (copiedCart.has(product.id)) {
      copiedCart.set(product.id, [...copiedCart.get(product.id)!, product]);
    } else {
      copiedCart.set(product.id, [product]);
    }
    setCart(copiedCart);
  }

  const removeFromCart = (product: Product) => {
    const copiedCart = new Map(cart);
    if (copiedCart.has(product.id)) {
      const products = [...copiedCart.get(product.id)!]
      products.pop()
      if (products) {
        copiedCart.set(product.id, products);
      } else {
        copiedCart.set(product.id, []);
      }
      setCart(copiedCart);
    } else {
      copiedCart.delete(product.id);
      setCart(copiedCart);
    }
  }

  const totalPriceFun = () => {
    const values = Array.from(cart.values()).flat();
    let totalPrice = 0;
    for (const element of values) {
      totalPrice += element.id
    }
    return totalPrice
  }

  const totalPrice = totalPriceFun()
  return {
    cart, setCart, addToCart, removeFromCart, totalPrice
  }
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [refresh, setRefresh] = useState(Math.random());
  const [showCart, setShowCart] = useState(false)

  const {
    page,
    recordsPerPage,
    isPreviousDisabled,
    nextPage,
    previousPage,
    handleRecordsNumberChange
  } = usePagination();

  const {
    search,
    filterProducts,
    handleSearchChange
  } = useFilter(products);

  const {
    sorted,
    order,
    handleOrderChange
  } = useSort(filterProducts);

  const {
    productDetails,
    handleSelectedElement
  } = useDetails(sorted);

  const {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    totalPrice
  } = useCart();


  useEffect(() => {
    const delayFunction = (json: Product) => {
      return new Promise((res) => {
        setTimeout(() => {
          res(json)
        }, 1000)
      })
    }
    setIsError(false);
    setIsLoading(true);
    fetch(`https://jsonplaceholder.typicode.com/photos?_start=${page * recordsPerPage
      }&_limit=${recordsPerPage}`)
      .then((res) => res.json())
      .then((res) => delayFunction(res))
      .then((res) => setProducts(res as Product[]))
      .catch((err) => {
        setIsError(true);
        console.error(err);
      })
      .finally(() => { setIsLoading(false) })
  }, [refresh, page, recordsPerPage])

  if (isError) {
    return (
      <div>
        <button onClick={() => setRefresh(Math.random())}> Retry</button>
      </div>)
  }

  return (
    <>
      <div>
        <button onClick={() => setShowCart(toggle => !toggle)}>Show cart</button>
        {showCart ? <Cart
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
        /> : null}
        <br></br>
        Total price: {JSON.stringify(totalPrice)}
        <br></br>

        <input onChange={handleSearchChange} value={search}></input>
        {isLoading ? <span className="loader"></span> : ""}
        {JSON.stringify(productDetails)}

        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Album id</th>
              <th>Image 1</th>
              <th onClick={handleOrderChange}>Title</th>
              <th>Image 2</th>
            </tr>
          </thead>
          <tbody >
            {sorted.map((product) => {
              return (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.albumId}</td>
                  <td> <img src={product.thumbnailUrl} alt="image" height={"50px"} width={"50px"} /></td>
                  <td>{product.title}</td>
                  <td> <img src={product.url} alt="image" height={"50px"} width={"50px"} /></td>
                  <button onClick={() => addToCart(product)}>Add to cart</button>
                  <button onClick={() => removeFromCart(product)}>Remove from cart</button>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div>
          <select value={recordsPerPage} onChange={(e) => { handleRecordsNumberChange(e) }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <button onClick={previousPage} disabled={isPreviousDisabled}>Previous page</button>
          <button onClick={nextPage}>Next page</button>
        </div>
      </div >
    </>

  )
}

export default App
