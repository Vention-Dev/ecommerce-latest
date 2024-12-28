import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import { apiGET, apiPOST } from "../../utilities/apiHelpers";
import { useDispatch, useSelector } from "react-redux";
import { removeUser, setUser, setCurrency, setCurrencyConvertedRate } from "../../redux/users/users";
import { FiShoppingCart } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import { BiUser } from "react-icons/bi";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsSearch } from "react-icons/bs";
import Signup from "../signup/signup";
import Login from "../signup/login";
import ForgetPassword from "../signup/forgetPassword";
import ModalCartItem from "./modalCartItem";
import logo from "../../assets/logo.svg";
import login from "../../assets/login.svg";
import loginWhite from "../../assets/login-white.svg";
import SearchComponent from "../searchComponent/searchComp";
import moment from "moment";
import useDebounce from "../../utilities/useDebounce";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { convertCurrency } from "currency-converter-latest";
import CurrencyConvertComp from "../currencyConvertComp";

const NavbarTwo = () => {
	const [mobileMenu, setMobileMenu] = useState(false);
	const [showSignup, setShowSignup] = useState(false);
	const [showLogin, setShowLogin] = useState(false);
	const [showForgetPassword, setShowForgetPassword] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [MyCartData, setMyCartData] = useState([]);
	const [MyCartItemsCount, setMyCartItemsCount] = useState(0);
	const [subTotal, setSubTotal] = useState(0);
	const dispatch = useDispatch();
	const { userData, currency } = useSelector((state) => state.user);
	const [SearchKeyword, setSearchKeyword] = useState("");
	const [Products, setProducts] = useState([]);
	const [searchInputVisible, setSearchInputVisible] = useState(false);
	const [autoDiscount, setAutoDiscount] = useState(false);
	const [siteData, setSiteData] = useState([]);
	const [currencies, setCurrencies] = useState([]);
	const [selectedCurrency, setSelectedCurrency] = useState("GBP");

	const toggleSearchInput = () => {
		setSearchInputVisible(!searchInputVisible);
	};

	const Navigate = useNavigate();

	let navLinks = [
		{ link: "/", title: "Home" },
		{ link: "/shop", title: "Shop" },
		{ link: "/category-apparel", title: "Apparel" },
		{ link: "/category-accessories", title: "Accessories" },
		{ link: "/contact", title: "Wholesale" },
		{ link: "/about", title: "About Us" },
		{ link: "/blog", title: "Blog" },
		{ link: "/faq", title: "FAQs" },
	];

	const responsive = {
		desktop: {
			breakpoint: { max: 5000, min: 1400 },
			items: 3,
		},
		tablet: {
			breakpoint: { max: 1399, min: 992 },
			items: 2,
		},
		mobile: {
			breakpoint: { max: 991, min: 0 },
			items: 1,
		},
	};

	const handleShowSignup = () => {
		setShowLogin(false);
		setShowSignup(true);
	};
	const handleShowLogin = () => {
		setShowSignup(false);
		setShowLogin(true);
	};

	const handelShowForgetPassword = () => {
		setShowSignup(false);
		setShowLogin(false);
		setShowForgetPassword(true);
	};

	const handleCloseSignup = () => {
		setShowSignup(false);
	};
	const handleCloseLogin = () => {
		setShowLogin(false);
	};

	const handleCloseForgetPassword = () => {
		setShowForgetPassword(false);
	};

	const closeDropdown = () => {
		setShowDropdown(false);
	};

	let fetchSiteMetadata = async () => {
		let res = await apiGET(`/v1/site-metadata/get-site-metadata-by-type?type=${"navbar"}`);
		if (res?.status == 200) setSiteData(res.data.data.data[0].statements);
	};

	useEffect(() => {
		fetchSiteMetadata();
		document.addEventListener("mousedown", closeDropdown, handleCloseSignup);
		return () => {
			document.removeEventListener("mousedown", closeDropdown, handleCloseSignup);
		};
	}, []);

	const renewToken = async () => {
		try {
			let payload = {
				refreshToken: localStorage.getItem("refreshToken"),
			};
			const response = await apiPOST(`/v1/auth/renew-token`, payload);
			if (response?.status === 200) {
				dispatch(
					setUser({
						user: userData,
						...response?.data,
					})
				);
				localStorage.setItem("refreshToken", response?.data?.refresh?.token);
				localStorage.setItem("accessToken", response?.data?.access?.token);
			} else {
				handleLogout();
			}
		} catch (error) {
			console.error("Error renew token:", error);
		}
	};

	const getMyCart = async () => {
		if (userData != null) {
			try {
				const response = await apiGET(`/v1/cart/get-my-cart`);
				if (response?.status === 200) {
					setMyCartData(response?.data?.data?.data?.cart);
					setMyCartItemsCount(response?.data?.data?.totalItems);
					setAutoDiscount(response?.data?.data?.data?.auto_discount);
					let carts = response?.data?.data?.data?.cart;

					let totalPrice = 0;
					if (carts?.length) {
						for (let i = 0; i < carts?.length; i++) {
							totalPrice +=
								Number(carts[i]?.sale_price || carts[i]?.productDetails[0]?.price) *
								Number(carts[i]?.quantity);
						}
					}
					setSubTotal(totalPrice.toFixed(2));
				} else {
					renewToken();
					console.error("Error fetching Cart data:", response.data?.data);
				}
			} catch (error) {
				console.error("Error fetching collection data:", error);
			}
		} else {
			try {
				let paylod = {
					deviceId: localStorage.getItem("deviceId"),
				};

				const response = await apiPOST(`/v1/cart/nouser-get-my-cart`, paylod);
				if (response?.status === 200) {
					setMyCartData(response?.data?.data?.data?.cart);
					setMyCartItemsCount(response?.data?.data?.totalItems);
					let carts = response?.data?.data?.data?.cart;
					let totalPrice = 0;
					if (carts?.length) {
						for (let i = 0; i < carts?.length; i++) {
							// totalPrice += carts[i]?.productDetails[0]?.price * carts[i]?.quantity
							totalPrice +=
								Number(carts[i]?.sale_price || carts[i]?.productDetails[0]?.price) *
								Number(carts[i]?.quantity);
						}
					}
					setSubTotal(totalPrice.toFixed(2));
				} else {
					console.error("Error fetching Cart data:", response.error);
				}
			} catch (error) {
				console.error("Error fetching collection data:", error);
			}
		}
	};

	const getSerchProducts = async () => {
		try {
			const response = await apiGET(`/v1/products/get-searchproducts?keyWord=${SearchKeyword}`);
			if (response?.status === 200) {
				setProducts(response?.data?.data.slice(0, 5));
			} else {
				console.error("Error fetching collection data:", response.error);
			}
		} catch (error) {
			console.error("Error fetching collection data:", error);
		}
	};

	const getTopSallingProduct = async () => {
		let formattedDate = moment().subtract(7, "days").startOf("day").toDate();

		let curruntDate = new Date();
		let response;
		response = await apiGET(`/v1/order/topFiveProduct?startDate=${formattedDate}&endDate=${curruntDate}`);

		if (response.status == 200) {
			let arrayElement = response?.data?.data.slice(0, 6);
			let filteredArray = arrayElement.filter((item) => item.productName !== "Mixed Wholesale");
			setProducts(filteredArray);
		}
	};

	const syncCart = async () => {
		let payload = {
			deviceId: localStorage.getItem("deviceId"),
		};

		try {
			const response = await apiPOST(`/v1/cart/sync-cart`, payload);
			if (response?.status == 200) {
				getMyCart();
			} else {
				console.error("Error fetching collection data:", response.error);
			}
		} catch (error) {
			console.error("Error fetching collection data:", error);
		}
	};

	useEffect(() => {
		getMyCart();
	}, [SearchKeyword]);

	useEffect(() => {
		setTimeout(() => {
			if (userData != null) {
				syncCart();
			} else {
				getMyCart();
			}
		}, 2000);
	}, [userData]);

	useDebounce(
		() => {
			if (SearchKeyword?.trim()?.length != 0) {
				getSerchProducts();
			} else {
				setProducts([]);
				getTopSallingProduct();
			}
		},
		2000,
		[SearchKeyword]
	);

	const handleLogout = (e) => {
		dispatch(removeUser());
		localStorage.clear();
		Navigate("/");
		window.location.reload();
	};

	let mobileMenuRef = useRef();

	useEffect(() => {
		const checkIfClickedOutside = (e) => {
			if (mobileMenu && !mobileMenuRef.current?.contains(e.target)) {
				setMobileMenu(false);
			}
		};
		document.addEventListener("mousedown", checkIfClickedOutside);
		return () => {
			document.removeEventListener("mousedown", checkIfClickedOutside);
		};
	}, [mobileMenu]);

	const [currentText, setCurrentText] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentText((prevText) => (prevText === 2 ? 0 : prevText + 1));
		}, 2500); // Change text every 2 seconds
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		getTopSallingProduct();
		const offcanvasElement = document.getElementById("Backdrop");
		const handleShow = () => {
			getMyCart();
		};

		offcanvasElement.addEventListener("show.bs.offcanvas", handleShow);

		// Cleanup the event listener on component unmount
		return () => {
			offcanvasElement.removeEventListener("show.bs.offcanvas", handleShow);
		};
	}, []);

	const currencyConvertor = async () => {
		try {
			const response = await fetch('https://countriesnow.space/api/v0.1/countries/currency');
			if (!response.ok) {
				dispatch(
					setCurrency({ currency: "GBP" })
				)
				throw new Error('Network response was not ok ' + response.statusText);
			}
			const data = await response.json();
			console.log("data:-", data);

			const allCurrencies = data.data.map(country => country.currency);
			const uniqueCurrencies = [...new Set(allCurrencies)]
			const desiredCurrencies = ["GBP", "USD", "AUD", "CAD", "EUR"];  // Define the specific currencies you want
			const filteredCurrencies = uniqueCurrencies.filter(currency => desiredCurrencies.includes(currency));
			setCurrencies(filteredCurrencies);
			if (currency === undefined || currency === null || currency === "") {
				dispatch(
					setCurrency({ currency: "GBP" })
				)
			}
		} catch (error) {
			console.error('Error fetching currency data:', error);
		}
	};

	const performConversion = async () => {
		try {
			const result = await convertCurrency("GBP", currency, 1);
			dispatch(setCurrencyConvertedRate({ currencyConvertedRate: Number(result).toFixed(3) }));
		} catch (error) {
			console.error('Conversion failed:', error);
		}
	};

	useEffect(() => {
		currencyConvertor()
	}, [])

	useEffect(() => {
		setSelectedCurrency(currency)
		performConversion()
	}, [currency])

	console.log("currencies", currencies);


	const connectWallet = async () => {
		try {
			if (window.ethereum) {
				const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
				console.log('Connected account:', accounts[0]);
			} else {
				alert('Please install MetaMask!');
			}
		} catch (error) {
			console.log(error)
		}
	}
	return (
		<>
			<div
				class="offcanvas offcanvas-end"
				data-bs-scroll="true"
				tabindex="-1"
				id="Backdrop"
				aria-labelledby="BackdropLabel"
			>
				<div class="offcanvas-header " style={{ backgroundColor: "#0396FF" }}>
					<h5 class="w-full text-center offcanvas-title text-white fw-bold" id="BackdropLabel">
						<div className="row ">
							<div className=" d-flex  gap-3">
								<div>
									<IoIosArrowForward data-bs-dismiss="offcanvas" />
								</div>
								<div className="d-flex justify-content-center">Cart</div>
							</div>
						</div>
					</h5>
					<div>
						<img src={logo} alt="logo-sidebar" className="logo-sidebar"></img>
					</div>
				</div>

				<div class="offcanvas-body">
					{MyCartData?.length > 0 ? (
						<>
							{MyCartData.map((item, index) => (
								<ModalCartItem cartDetail={item} getMyCart={getMyCart} />
							))}
						</>
					) : (
						""
					)}
				</div>
				<div class="offcanvas-footer">
					<div class="d-grid m-3">
						{subTotal != 0 ? (
							<div className="fs-3 mt-2">
								<p style={{ marginBottom: "0" }}>Subtotal</p>
								<p>
									<CurrencyConvertComp amount={subTotal} />
								</p>
							</div>
						) : (
							""
						)}
						<Link to="/cart" className="w-100">
							{" "}
							<button
								data-bs-dismiss="offcanvas"
								class="btn btn-dark  w-100"
								type="button"
								style={{ borderRadius: "0" }}
							>
								View Cart
							</button>{" "}
						</Link>
					</div>
				</div>
			</div>

			{siteData?.length ? (
				<div className="px-3 px-sm-5 py-2 d-block d-xl-none">
					<Carousel
						responsive={responsive}
						autoPlay={true}
						arrows={false}
						infinite
						showDots={false}
						stopOnHover={true}
						swipeable={true}
						keyBoardControl={false}
						autoPlaySpeed={3000}
						className="w-100"
					>
						{siteData?.map((statement, id) => (
							<div
								key={id}
								className="text-center text-xl-start d-flex justify-content-center  justify-content-xl-start align-items-center h-100"
								style={{ letterSpacing: "3px", textDecoration: "capitalize", fontSize: "14px" }}
							>
								{statement}
							</div>
						))}
					</Carousel>
					<div></div>
				</div>
			) : (
				""
			)}
			{siteData?.length ? (
				<div>
					<div className="w-100 d-none d-xl-flex gap-3 avenir  bg-white py-2 px-3 px-sm-5 justify-content-center align-items-center ">
						{siteData?.map((statement, id) => (
							<>
								<div
									key={id}
									style={{ letterSpacing: "3px", textDecoration: "capitalize", fontSize: 14 }}
								>
									{statement}{" "}
								</div>
								{siteData?.length - 1 != id ? <div>|</div> : ""}
							</>
						))}
					</div>
					<div></div>
				</div>
			) : (
				""
			)}

			<div>
				<div className=" bg-prime  py-lg-1">
					<div className="px-3 px-sm-5">
						<div className=" d-flex w-100 justify-content-between align-items-center py-1">
							<Link to={"/"} className="text-decoration-none">
								<div className="pb-2 pt-2 ">
									{" "}
									<img src={logo} alt="logo-theSnuslife" className="logo-size" />{" "}
								</div>
							</Link>
							{navLinks?.length ? (
								<div className="d-none d-lg-flex gap-3 gap-xxl-4 px-2">
									{navLinks.map((item, index) => (
										<Link
											key={index}
											to={`${item?.link}`}
											className={`nav-fs text-dark text-decoration-none`}
										>
											<div
												className="avenir-semibold"
												onClick={() => {
													if (localStorage.getItem("brandId")) {
														localStorage.removeItem("brandId");
													}
												}}
											>
												{item?.title}
											</div>
										</Link>
									))}
								</div>
							) : (
								""
							)}
							<div className={`d-flex gap-3 align-items-center gap-sm-4`} style={{ height: "42px" }}>
								{currencies?.length ? <div className="d-none d-lg-block">
									<select
										style={{
											width: "65px", border: "1px solid black",
											borderRadius: "6px", padding: "4px 0", fontSize: "14px",
											fontWeight: 600, background: "transparent"
										}}
										value={selectedCurrency} onChange={(e) => {
											setSelectedCurrency(e.target.value)
											dispatch(
												setCurrency({ currency: e.target.value })
											)
										}}>
										<option disabled>Currency</option>
										{currencies.map((item, id) => (
											<option className="" key={id} value={item}>
												{item}
											</option>
										))}
									</select>
								</div>
									:
									""
								}
								<div className="justify-content-center cursor-pointer d-flex align-items-center ">
									{searchInputVisible ? (
										<SearchComponent
											SearchKeyword={SearchKeyword}
											setSearchKeyword={setSearchKeyword}
											toggleSearchInput={toggleSearchInput}
											products={Products}
										/>
									) : (
										""
									)}
									<BsSearch
										className="text-dark"
										onClick={toggleSearchInput}
										style={{ fontSize: "26px" }}
									/>
								</div>
								<div
									onClick={() => {
										getMyCart();
									}}
									data-bs-toggle="offcanvas"
									data-bs-target="#Backdrop"
									className=" cursor-pointer align-items-center d-flex "
								>
									{MyCartItemsCount ? (
										<div className="position-relative  cursor-pointer align-items-center d-flex ">
											<FiShoppingCart style={{ fontSize: "28px" }} />
											<span
												style={{
													fontWeight: "bolder",
													height: "12px",
													width: "12px",
													top: "0px",
													left: "19.5px",
													border: "1px solid white",
													backgroundColor: "#4df75c",
													borderRadius: "100px",
												}}
												className={`position-absolute justify-content-center d-flex align-items-center boder-none anton"  `}
											></span>
										</div>
									) : (
										<FiShoppingCart style={{ fontSize: "28px" }} />
									)}
								</div>
								{
									userData ? (
										<div class="dropdown d-none d-lg-block " style={{ marginLeft: "-12px" }}>
											<button
												class="btn btn-transparent dropdown-toggle"
												type="button"
												id="dropdownMenuButton1"
												data-bs-toggle="dropdown"
												aria-expanded="false"
											>
												<BiUser className="fs-3" />
											</button>
											<ul
												class="dropdown-menu"
												aria-labelledby="dropdownMenuButton1"
												onClick={() => {
													if (localStorage.getItem("brandId")) {
														localStorage.removeItem("brandId");
													}
												}}
											>
												<li>
													<Link
														to="/ordersPage"
														className={`d-block dropdown-item text-decoration-none text-dark `}
													>
														My Orders
													</Link>
												</li>
												<li>
													<Link
														to="/account/my-addresses"
														className={`d-block dropdown-item text-decoration-none text-dark`}
													>
														My Addresses{" "}
													</Link>
												</li>
												<li>
													<Link
														to="/myWishlist"
														className={`d-block dropdown-item text-decoration-none text-dark`}
													>
														My Wishlist
													</Link>
												</li>
												<li>
													<Link
														to="/account"
														className={`d-block dropdown-item text-decoration-none text-dark`}
													>
														My Account
													</Link>
												</li>
												<li>
													<button
														className="dropdown-item"
														onClick={() => {
															handleLogout();
														}}
													>
														Logout
													</button>
												</li>
											</ul>
										</div>
									) : (
										<img
											onClick={handleShowSignup}
											className="cursor-pointer"
											src={login}
											alt="login"
											style={{ width: "31px", height: "37px" }}
										></img>
									)
								}
								<button className="border px-3 py-2" onClick={connectWallet}>Connect <br /> Wallet</button>
								<div className="justify-content-center cursor-pointer d-flex  d-lg-none align-items-center">
									<RxHamburgerMenu
										onClick={() => {
											setMobileMenu(!mobileMenu);
										}}
										className="fs-2"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="">
					{mobileMenu ? (
						<div
							ref={mobileMenuRef}
							className={` d-flex flex-column d-lg-none position-fixed bg-white gap-4 p-4`}
							style={{
								top: "0px",
								right: "0px",
								zIndex: "100",
								maxWidth: "300px",
								width: "100%",
								height: "100vh",
								backgroundColor: "white",
							}}
						>
							<div
								className="d-flex  "
								style={{
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								{userData ? (
									<div
										className="dropdown d-flex justify-content-center  "
										style={{
											color: "black",
											border: "1px solid black",
											borderRadius: "10px",
										}}
									>
										<button
											class="btn btn-transparent dropdown-toggle"
											type="button"
											id="dropdownMenuButton1"
											data-bs-toggle="dropdown"
											aria-expanded="false"
											style={{ color: "black" }}
										>
											<BiUser className="fs-3 text-black" />
										</button>
										<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
											<li
												onClick={() => {
													if (localStorage.getItem("brandId")) {
														localStorage.removeItem("brandId");
													}
												}}
											>
												<Link
													to="/ordersPage"
													className={`d-block dropdown-item text-decoration-none text-black`}
												>
													My Orders
												</Link>
											</li>
											<li>
												<Link
													to="/account/my-addresses"
													className={`d-block dropdown-item text-decoration-none text-black`}
												>
													My Addresses{" "}
												</Link>
											</li>
											<li>
												<Link
													to="/myWishlist"
													className={`d-block dropdown-item text-decoration-none text-black`}
												>
													My Wishlist
												</Link>
											</li>
											<li>
												<Link
													to="/account"
													className={`d-block dropdown-item text-decoration-none text-black`}
												>
													My Account
												</Link>
											</li>
											<li>
												<button
													className="dropdown-item text-black"
													onClick={() => {
														handleLogout();
													}}
												>
													Logout
												</button>
											</li>
										</ul>
									</div>
								) : (
									<button className="text-white d-flex justify-content-center cursor-pointer custom-button">
										<div className="d-flex align-item-center" onClick={handleShowSignup}>
											<img
												src={loginWhite}
												alt="login"
												style={{ width: "31px", height: "34px" }}
											></img>
										</div>
									</button>
								)}
								{currencies?.length ? <div>
									<select
										style={{
											width: "65px", border: "1px solid black",
											borderRadius: "6px", padding: "4px 0", fontSize: "14px",
											fontWeight: 600, background: "transaparent"
										}}
										value={selectedCurrency} onChange={(e) => {
											setSelectedCurrency(e.target.value)
											dispatch(
												setCurrency({ currency: e.target.value })
											)
										}}>
										<option disabled>Currency</option>
										{currencies.map((item, id) => (
											<option className="" key={id} value={item}>{item}</option>
										))}
									</select>
								</div>
									:
									""
								}

								<svg
									className="cursor-pointer "
									onClick={() => {
										setMobileMenu(false);
									}}
									stroke="currentColor"
									fill="currentColor"
									stroke-width="0"
									viewBox="0 0 24 24"
									height="1em"
									width="1em"
									xmlns="http://www.w3.org/2000/svg"
									class="fs-3"
								>
									<path fill="none" stroke="#000" stroke-width="3" d="M3,3 L21,21 M3,21 L21,3"></path>
								</svg>
							</div>
							<div className="text-center fs-3 text-black">Menu</div>

							{navLinks?.length ? (
								<div className="d-flex justify-content-center align-items-center flex-column gap-3 gap-xl-4 ">
									{navLinks.map((item, index) => (
										<Link
											style={{}}
											key={index}
											to={`${item?.link}`}
											onClick={() => {
												setMobileMenu(false);
											}}
											className={`text-black text-decoration-none `}
										>
											<div
												className="avenir-semibold"
												onClick={() => {
													if (localStorage.getItem("brandId")) {
														localStorage.removeItem("brandId");
													}
												}}
											>
												{item?.title}
											</div>
										</Link>
									))}
								</div>
							) : (
								""
							)}
						</div>
					) : (
						""
					)}
				</div>
				<Signup show={showSignup} handleClose={handleCloseSignup} handleShowLogin={handleShowLogin} />
				<Login
					show={showLogin}
					handleClose={handleCloseLogin}
					handleShowSignup={handleShowSignup}
					handelShowForgetPassword={handelShowForgetPassword}
				/>
				<ForgetPassword show={showForgetPassword} handleClose={handleCloseForgetPassword} />
			</div>
		</>
	);
};

export default NavbarTwo;
